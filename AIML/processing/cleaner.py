"""
processing/cleaner.py

Conservative transcript cleaning for speech-to-text output.

The cleaner removes transcription artifacts and formatting noise while
preserving meaningful speech content, repetitions, hesitations, and
sentence structure.

Pipeline position:

    TranscriptBuilder
            ↓
        Cleaner
            ↓
       Normalizer
            ↓
 ConversationProcessor
            ↓
    SemanticChunker
            ↓
       Embeddings
"""

import re
from typing import Dict, List, Optional


class TranscriptCleaner:
    """
    Clean speech-to-text transcripts conservatively.

    Important:
        This class does NOT perform privacy redaction.
        Names, personal information, and sensitive content are intentionally
        preserved here. Privacy processing belongs in the privacy/ package.

    By default:
        - Whisper artifacts are removed
        - excessive whitespace is normalized
        - broken punctuation is cleaned
        - repeated punctuation is reduced
        - meaningful word repetitions are preserved
        - filler words are preserved
        - speech content is not aggressively rewritten
    """

    # Common artifacts that speech-to-text systems can produce.
    WHISPER_ARTIFACTS = {
        "[BLANK_AUDIO]",
        "[BLANK]",
        "[MUSIC]",
        "[MUSICAL]",
        "[APPLAUSE]",
        "[LAUGHTER]",
        "[NOISE]",
        "[SILENCE]",
        "(BLANK_AUDIO)",
        "(BLANK)",
        "(MUSIC)",
        "(APPLAUSE)",
        "(LAUGHTER)",
        "(NOISE)",
        "(SILENCE)",
    }

    # These are usually transcription/system artifacts rather than
    # meaningful spoken content.
    ARTIFACT_PATTERNS = [
        r"\[inaudible\]",
        r"\[unintelligible\]",
        r"\(inaudible\)",
        r"\(unintelligible\)",
        r"\[background noise\]",
        r"\(background noise\)",
    ]

    def __init__(
        self,
        remove_artifacts: bool = True,
        normalize_whitespace: bool = True,
        normalize_punctuation: bool = True,
        remove_filler_words: bool = False,
        remove_repeated_words: bool = False,
    ):
        """
        Args:
            remove_artifacts:
                Remove common ASR artifacts such as [MUSIC] or [NOISE].

            normalize_whitespace:
                Collapse unnecessary spaces and blank lines.

            normalize_punctuation:
                Reduce obvious punctuation artifacts such as "!!!" or "???".

            remove_filler_words:
                Remove words such as "um", "uh", "like".
                Default is False because fillers may contain useful
                behavioral/speech information.

            remove_repeated_words:
                Remove immediate repeated words.
                Default is False because repetition may be meaningful
                for downstream analysis.
        """
        self.remove_artifacts = remove_artifacts
        self.normalize_whitespace = normalize_whitespace
        self.normalize_punctuation = normalize_punctuation
        self.remove_filler_words = remove_filler_words
        self.remove_repeated_words = remove_repeated_words

        self.filler_words = {
            "um",
            "uh",
            "umm",
            "uhh",
            "er",
            "erm",
            "hmm",
            "hm",
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def clean(self, text: str) -> str:
        """
        Clean a single transcript string.

        Args:
            text: Raw transcript text.

        Returns:
            Cleaned transcript text.
        """

        if not isinstance(text, str):
            raise TypeError("text must be a string")

        if not text.strip():
            return ""

        cleaned = text

        if self.remove_artifacts:
            cleaned = self._remove_artifacts(cleaned)

        cleaned = self._normalize_unicode_punctuation(cleaned)

        if self.remove_filler_words:
            cleaned = self._remove_fillers(cleaned)

        if self.remove_repeated_words:
            cleaned = self._remove_repeated_words(cleaned)

        if self.normalize_punctuation:
            cleaned = self._normalize_punctuation(cleaned)

        if self.normalize_whitespace:
            cleaned = self._normalize_whitespace(cleaned)

        cleaned = self._remove_empty_brackets(cleaned)
        cleaned = self._fix_spacing(cleaned)

        return cleaned.strip()

    def clean_segment(self, segment: Dict) -> Dict:
        """
        Clean a single transcript segment while preserving metadata.

        Expected input:

            {
                "start": 0.0,
                "end": 3.5,
                "text": "hello   there"
            }

        Returns:

            {
                "start": 0.0,
                "end": 3.5,
                "text": "hello there"
            }
        """

        if not isinstance(segment, dict):
            raise TypeError("segment must be a dictionary")

        cleaned_segment = segment.copy()

        text = segment.get("text", "")

        if text is None:
            text = ""

        cleaned_segment["text"] = self.clean(text)

        return cleaned_segment

    def clean_segments(self, segments: List[Dict]) -> List[Dict]:
        """
        Clean a list of transcript segments.

        Segment timing and metadata are preserved.
        """

        if not isinstance(segments, list):
            raise TypeError("segments must be a list")

        return [
            self.clean_segment(segment)
            for segment in segments
            if isinstance(segment, dict)
        ]

    def clean_transcript(self, transcript: Dict) -> Dict:
        """
        Clean a complete transcript object.

        Example input:

            {
                "created_at": "...",
                "duration": 12.4,
                "segment_count": 2,
                "text": "hello   world",
                "segments": [...]
            }

        Metadata is preserved while transcript text is cleaned.
        """

        if not isinstance(transcript, dict):
            raise TypeError("transcript must be a dictionary")

        cleaned_transcript = transcript.copy()

        if "text" in transcript:
            cleaned_transcript["text"] = self.clean(
                transcript.get("text", "")
            )

        if "segments" in transcript:
            cleaned_transcript["segments"] = self.clean_segments(
                transcript.get("segments", [])
            )

        # Rebuild the main text from cleaned segments if segments exist.
        if cleaned_transcript.get("segments"):
            segment_text = " ".join(
                segment["text"]
                for segment in cleaned_transcript["segments"]
                if segment.get("text")
            )

            cleaned_transcript["text"] = self.clean(segment_text)

            cleaned_transcript["segment_count"] = len(
                cleaned_transcript["segments"]
            )

        return cleaned_transcript

    # ------------------------------------------------------------------
    # Artifact handling
    # ------------------------------------------------------------------

    def _remove_artifacts(self, text: str) -> str:
        """Remove common speech-recognition artifacts."""

        # Remove known exact artifacts.
        for artifact in self.WHISPER_ARTIFACTS:
            text = text.replace(artifact, " ")

        # Remove case-insensitively matched artifact patterns.
        for pattern in self.ARTIFACT_PATTERNS:
            text = re.sub(
                pattern,
                " ",
                text,
                flags=re.IGNORECASE,
            )

        return text

    # ------------------------------------------------------------------
    # Unicode / punctuation
    # ------------------------------------------------------------------

    def _normalize_unicode_punctuation(self, text: str) -> str:
        """
        Convert common typographic punctuation into simpler equivalents.

        This does not alter words or meaning.
        """

        replacements = {
            "\u2018": "'",   # left single quote
            "\u2019": "'",   # right single quote
            "\u201c": '"',   # left double quote
            "\u201d": '"',   # right double quote
            "\u2013": "-",   # en dash
            "\u2014": "-",   # em dash
            "\u2212": "-",   # minus sign
            "\u2026": "...", # ellipsis
            "\u00a0": " ",   # non-breaking space
        }

        for old, new in replacements.items():
            text = text.replace(old, new)

        return text

    def _normalize_punctuation(self, text: str) -> str:
        """
        Normalize obvious punctuation artifacts.

        Meaningful punctuation is retained.
        """

        # More than 3 periods -> ellipsis.
        text = re.sub(r"\.{4,}", "...", text)

        # Repeated exclamation/question marks.
        text = re.sub(r"!{2,}", "!", text)
        text = re.sub(r"\?{2,}", "?", text)

        # Excess commas/semicolons.
        text = re.sub(r",{2,}", ",", text)
        text = re.sub(r";{2,}", ";", text)

        # Avoid spaces immediately before punctuation.
        text = re.sub(r"\s+([,.!?;:])", r"\1", text)

        # Ensure basic spacing after punctuation when another word follows.
        text = re.sub(
            r"([,.!?;:])([A-Za-z])",
            r"\1 \2",
            text,
        )

        return text

    def _fix_spacing(self, text: str) -> str:
        """Fix common spacing problems around punctuation."""

        # Remove spaces directly inside parentheses.
        text = re.sub(r"\(\s+", "(", text)
        text = re.sub(r"\s+\)", ")", text)

        # Remove spaces directly inside brackets.
        text = re.sub(r"\[\s+", "[", text)
        text = re.sub(r"\s+\]", "]", text)

        # Avoid multiple spaces.
        text = re.sub(r"[ \t]+", " ", text)

        return text

    def _normalize_whitespace(self, text: str) -> str:
        """Normalize spaces, tabs, and excessive newlines."""

        # Normalize Windows / old Mac line endings.
        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")

        # Collapse horizontal whitespace.
        text = re.sub(r"[ \t]+", " ", text)

        # Maximum two consecutive newlines.
        text = re.sub(r"\n{3,}", "\n\n", text)

        # Remove whitespace at the beginning/end of lines.
        text = re.sub(r"[ \t]+\n", "\n", text)
        text = re.sub(r"\n[ \t]+", "\n", text)

        return text.strip()

    def _remove_empty_brackets(self, text: str) -> str:
        """Remove empty brackets left behind after artifact removal."""

        text = re.sub(r"\[\s*\]", " ", text)
        text = re.sub(r"\(\s*\)", " ", text)

        return text

    # ------------------------------------------------------------------
    # Optional speech cleaning
    # ------------------------------------------------------------------

    def _remove_fillers(self, text: str) -> str:
        """
        Remove obvious filler words.

        Disabled by default.

        This method intentionally uses word boundaries so that words such
        as "umbrella" are not accidentally modified because they contain
        "um".
        """

        if not text:
            return text

        filler_pattern = r"\b(?:" + "|".join(
            re.escape(word) for word in sorted(
                self.filler_words,
                key=len,
                reverse=True,
            )
        ) + r")\b"

        return re.sub(
            filler_pattern,
            " ",
            text,
            flags=re.IGNORECASE,
        )

    def _remove_repeated_words(self, text: str) -> str:
        """
        Remove immediate repeated words.

        Example:

            "I I I feel tired"

        becomes:

            "I feel tired"

        Disabled by default because repetitions can be useful signals.
        """

        if not text:
            return text

        pattern = r"\b([A-Za-z]+)(?:\s+\1\b)+"

        return re.sub(
            pattern,
            r"\1",
            text,
            flags=re.IGNORECASE,
        )


# ----------------------------------------------------------------------
# Convenience function
# ----------------------------------------------------------------------

def clean_text(
    text: str,
    remove_artifacts: bool = True,
) -> str:
    """
    Convenience wrapper for cleaning plain transcript text.
    """

    cleaner = TranscriptCleaner(
        remove_artifacts=remove_artifacts,
    )

    return cleaner.clean(text)


# ----------------------------------------------------------------------
# Local test
# ----------------------------------------------------------------------

if __name__ == "__main__":

    cleaner = TranscriptCleaner()

    test_text = """
        [BLANK_AUDIO]
        I   don't know... um, I mean, I don't know!!!
        [NOISE]
        Things have been really difficult lately...
        """

    print("=" * 60)
    print("TRANSCRIPT CLEANER TEST")
    print("=" * 60)

    print("\nOriginal:")
    print(test_text)

    cleaned = cleaner.clean(test_text)

    print("\nCleaned:")
    print(cleaned)

    print("\n" + "=" * 60)
    print("REPETITION TEST")
    print("=" * 60)

    repetition_text = "I I I don't know what to do... really really."

    print("\nOriginal:")
    print(repetition_text)

    print("\nDefault cleaner:")
    print(cleaner.clean(repetition_text))

    repetition_cleaner = TranscriptCleaner(
        remove_repeated_words=True
    )

    print("\nWith repeated-word removal:")
    print(repetition_cleaner.clean(repetition_text))

    print("\n" + "=" * 60)
    print("FILLER TEST")
    print("=" * 60)

    filler_text = "Um, I uh think that things are getting difficult."

    print("\nOriginal:")
    print(filler_text)

    print("\nDefault cleaner:")
    print(cleaner.clean(filler_text))

    filler_cleaner = TranscriptCleaner(
        remove_filler_words=True
    )

    print("\nWith filler removal:")
    print(filler_cleaner.clean(filler_text))