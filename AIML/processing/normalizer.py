"""
processing/normalizer.py

Normalize processed speech transcripts into a consistent textual format.

The normalizer is intentionally conservative. It should make transcripts
consistent for downstream processing and embeddings without changing the
speaker's meaning or removing potentially useful speech characteristics.

Pipeline:

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
from typing import Dict, List


class TranscriptNormalizer:
    """
    Normalize transcript text and transcript structures.

    This class does NOT:
        - perform privacy redaction
        - remove PII
        - perform sentiment analysis
        - summarize
        - rewrite meaning
        - correct every grammatical error

    It focuses on consistency and downstream model compatibility.
    """

    def __init__(
        self,
        lowercase: bool = False,
        normalize_numbers: bool = False,
        normalize_contractions: bool = False,
        normalize_repeated_spaces: bool = True,
        normalize_line_breaks: bool = True,
    ):
        """
        Args:
            lowercase:
                Convert all text to lowercase.

                Default False because capitalization can sometimes be
                useful metadata and embeddings generally handle case.

            normalize_numbers:
                Normalize spacing around numbers.

                Default False to avoid changing potentially meaningful
                numerical information.

            normalize_contractions:
                Expand common contractions such as "don't" → "do not".

                Default False because changing spoken wording is undesirable.

            normalize_repeated_spaces:
                Collapse multiple spaces.

            normalize_line_breaks:
                Normalize excessive line breaks.
        """

        self.lowercase = lowercase
        self.normalize_numbers = normalize_numbers
        self.normalize_contractions = normalize_contractions
        self.normalize_repeated_spaces = normalize_repeated_spaces
        self.normalize_line_breaks = normalize_line_breaks

        self.contractions = {
            "can't": "cannot",
            "won't": "will not",
            "don't": "do not",
            "doesn't": "does not",
            "didn't": "did not",
            "isn't": "is not",
            "aren't": "are not",
            "wasn't": "was not",
            "weren't": "were not",
            "haven't": "have not",
            "hasn't": "has not",
            "hadn't": "had not",
            "wouldn't": "would not",
            "shouldn't": "should not",
            "couldn't": "could not",
            "mustn't": "must not",
            "mightn't": "might not",
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def normalize(self, text: str) -> str:
        """
        Normalize a single transcript string.

        Args:
            text: Cleaned transcript text.

        Returns:
            Normalized transcript text.
        """

        if not isinstance(text, str):
            raise TypeError("text must be a string")

        if not text.strip():
            return ""

        normalized = text

        normalized = self._normalize_unicode(normalized)

        if self.normalize_line_breaks:
            normalized = self._normalize_line_breaks(normalized)

        if self.normalize_repeated_spaces:
            normalized = self._normalize_spaces(normalized)

        if self.normalize_numbers:
            normalized = self._normalize_number_spacing(normalized)

        if self.normalize_contractions:
            normalized = self._expand_contractions(normalized)

        if self.lowercase:
            normalized = normalized.lower()

        return normalized.strip()

    def normalize_segment(self, segment: Dict) -> Dict:
        """
        Normalize one transcript segment while preserving metadata.

        Example:

            {
                "start": 0.0,
                "end": 3.2,
                "text": "Hello   there"
            }
        """

        if not isinstance(segment, dict):
            raise TypeError("segment must be a dictionary")

        normalized_segment = segment.copy()

        text = segment.get("text", "")

        if text is None:
            text = ""

        normalized_segment["text"] = self.normalize(text)

        return normalized_segment

    def normalize_segments(self, segments: List[Dict]) -> List[Dict]:
        """
        Normalize a list of transcript segments.
        """

        if not isinstance(segments, list):
            raise TypeError("segments must be a list")

        return [
            self.normalize_segment(segment)
            for segment in segments
            if isinstance(segment, dict)
        ]

    def normalize_transcript(self, transcript: Dict) -> Dict:
        """
        Normalize a complete transcript object.

        Metadata is preserved.
        Segment text is normalized individually.
        """

        if not isinstance(transcript, dict):
            raise TypeError("transcript must be a dictionary")

        normalized_transcript = transcript.copy()

        if "segments" in transcript:
            normalized_transcript["segments"] = self.normalize_segments(
                transcript.get("segments", [])
            )

        if "text" in transcript:
            normalized_transcript["text"] = self.normalize(
                transcript.get("text", "")
            )

        # Rebuild transcript text from normalized segments when available.
        if normalized_transcript.get("segments"):
            segment_text = " ".join(
                segment["text"]
                for segment in normalized_transcript["segments"]
                if segment.get("text")
            )

            normalized_transcript["text"] = self.normalize(
                segment_text
            )

            normalized_transcript["segment_count"] = len(
                normalized_transcript["segments"]
            )

        return normalized_transcript

    # ------------------------------------------------------------------
    # Normalization operations
    # ------------------------------------------------------------------

    def _normalize_unicode(self, text: str) -> str:
        """
        Normalize common Unicode whitespace and punctuation.
        """

        replacements = {
            "\u00a0": " ",    # non-breaking space
            "\u2009": " ",    # thin space
            "\u200a": " ",    # hair space
            "\u200b": "",     # zero-width space
            "\ufeff": "",     # BOM / zero-width no-break space
        }

        for old, new in replacements.items():
            text = text.replace(old, new)

        return text

    def _normalize_spaces(self, text: str) -> str:
        """
        Collapse repeated spaces without modifying word content.
        """

        text = re.sub(r"[ \t]+", " ", text)

        # Remove spaces at the beginning/end of lines.
        text = re.sub(r"[ \t]+\n", "\n", text)
        text = re.sub(r"\n[ \t]+", "\n", text)

        return text

    def _normalize_line_breaks(self, text: str) -> str:
        """
        Normalize line endings and excessive blank lines.
        """

        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")

        # Keep at most one blank line between blocks.
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text

    def _normalize_number_spacing(self, text: str) -> str:
        """
        Normalize spacing around numbers.

        This intentionally does NOT convert numbers to words or words
        to numbers.

        Examples:

            "20  25" → "20 25"
            "5 kg"   → "5 kg"
        """

        # Collapse spaces between adjacent digits.
        text = re.sub(r"(?<=\d)\s{2,}(?=\d)", " ", text)

        # Normalize spaces around decimal points.
        text = re.sub(
            r"(\d)\s+\.\s+(\d)",
            r"\1.\2",
            text,
        )

        return text

    def _expand_contractions(self, text: str) -> str:
        """
        Expand a small set of common English contractions.

        Disabled by default.
        """

        if not text:
            return text

        for contraction, expanded in self.contractions.items():
            pattern = rf"\b{re.escape(contraction)}\b"

            text = re.sub(
                pattern,
                expanded,
                text,
                flags=re.IGNORECASE,
            )

        return text


# ----------------------------------------------------------------------
# Convenience function
# ----------------------------------------------------------------------

def normalize_text(
    text: str,
    lowercase: bool = False,
) -> str:
    """
    Convenience wrapper for normalizing plain transcript text.
    """

    normalizer = TranscriptNormalizer(
        lowercase=lowercase,
    )

    return normalizer.normalize(text)


# ----------------------------------------------------------------------
# Local test
# ----------------------------------------------------------------------

if __name__ == "__main__":

    normalizer = TranscriptNormalizer()

    test_text = """
        I   don't know  what to do.

        Things have been   difficult lately...
    """

    print("=" * 60)
    print("TRANSCRIPT NORMALIZER TEST")
    print("=" * 60)

    print("\nOriginal:")
    print(test_text)

    normalized = normalizer.normalize(test_text)

    print("\nNormalized:")
    print(normalized)

    # --------------------------------------------------------------
    # Lowercase test
    # --------------------------------------------------------------

    print("\n" + "=" * 60)
    print("LOWERCASE TEST")
    print("=" * 60)

    lowercase_normalizer = TranscriptNormalizer(
        lowercase=True
    )

    print(
        lowercase_normalizer.normalize(
            "I Feel Like Things Are Getting Difficult."
        )
    )

    # --------------------------------------------------------------
    # Contraction test
    # --------------------------------------------------------------

    print("\n" + "=" * 60)
    print("CONTRACTION TEST")
    print("=" * 60)

    contraction_normalizer = TranscriptNormalizer(
        normalize_contractions=True
    )

    print(
        contraction_normalizer.normalize(
            "I don't know. I can't explain why."
        )
    )

    # --------------------------------------------------------------
    # Transcript structure test
    # --------------------------------------------------------------

    print("\n" + "=" * 60)
    print("TRANSCRIPT STRUCTURE TEST")
    print("=" * 60)

    transcript = {
        "created_at": "2026-01-01T12:00:00",
        "duration": 8.0,
        "segment_count": 2,
        "text": "Hello   there.   I feel tired.",
        "segments": [
            {
                "start": 0.0,
                "end": 2.0,
                "text": "Hello   there.",
            },
            {
                "start": 2.0,
                "end": 8.0,
                "text": "I   feel tired.",
            },
        ],
    }

    result = normalizer.normalize_transcript(transcript)

    print("\nNormalized transcript:")
    print(result)