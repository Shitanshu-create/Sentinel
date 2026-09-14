"""
processing/semantic_chunker.py

Create semantically coherent chunks from processed conversation text.

The chunker tries to preserve sentence and conversation boundaries instead
of blindly cutting text at a fixed character count.

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
            ↓
       Assessment


Important:
    This module does NOT:
        - perform privacy redaction
        - generate embeddings
        - calculate mental-health scores
        - summarize or rewrite text

Its only responsibility is deciding how processed conversation text should
be divided into embedding-friendly chunks.
"""

import re
from typing import Any, Dict, List, Optional


class SemanticChunker:
    """
    Split conversation text into semantically meaningful chunks.

    The chunking strategy is:

        1. Use transcript segments when available.
        2. Split segments into sentences.
        3. Pack consecutive sentences into chunks.
        4. Respect maximum word/character limits.
        5. Keep a small sentence overlap between chunks.
        6. Preserve source timing information where possible.

    Example:

        Input:

            "I have been feeling tired lately.
             Work has been difficult.
             I am not sleeping very well."

        Output:

            Chunk 1:
                "I have been feeling tired lately.
                 Work has been difficult."

            Chunk 2:
                "Work has been difficult.
                 I am not sleeping very well."
    """

    def __init__(
        self,
        max_words: int = 250,
        min_words: int = 30,
        max_characters: int = 1500,
        overlap_sentences: int = 1,
        min_chunk_words: int = 5,
    ):
        """
        Args:
            max_words:
                Preferred maximum number of words per chunk.

            min_words:
                Preferred minimum chunk size.

                A chunk can still be smaller when the source conversation
                itself is short.

            max_characters:
                Hard character limit for a chunk.

            overlap_sentences:
                Number of sentences repeated between neighboring chunks.

                Default = 1.

            min_chunk_words:
                Minimum number of words required for a standalone chunk
                before attempting to merge it with a neighboring chunk.
        """

        if max_words <= 0:
            raise ValueError("max_words must be greater than 0")

        if min_words < 0:
            raise ValueError("min_words cannot be negative")

        if max_characters <= 0:
            raise ValueError(
                "max_characters must be greater than 0"
            )

        if overlap_sentences < 0:
            raise ValueError(
                "overlap_sentences cannot be negative"
            )

        if min_chunk_words < 0:
            raise ValueError(
                "min_chunk_words cannot be negative"
            )

        self.max_words = max_words
        self.min_words = min_words
        self.max_characters = max_characters
        self.overlap_sentences = overlap_sentences
        self.min_chunk_words = min_chunk_words

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def chunk(
        self,
        text: str,
    ) -> List[Dict[str, Any]]:
        """
        Chunk plain conversation text.

        Timing information is unavailable when only raw text is supplied.

        Returns:

            [
                {
                    "chunk_id": 0,
                    "text": "...",
                    "word_count": 42,
                    "character_count": 220,
                    "start": None,
                    "end": None,
                    "duration": None
                }
            ]
        """

        if not isinstance(text, str):
            raise TypeError("text must be a string")

        text = text.strip()

        if not text:
            return []

        sentences = self._split_sentences(text)

        return self._build_chunks(
            sentences=sentences,
            source_segments=None,
        )

    def chunk_segments(
        self,
        segments: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Chunk transcript segments while preserving timing.

        Each input segment should look like:

            {
                "start": 0.0,
                "end": 4.5,
                "text": "I have been feeling tired."
            }
        """

        if not isinstance(segments, list):
            raise TypeError("segments must be a list")

        if not segments:
            return []

        sentence_items = []

        for segment_index, segment in enumerate(segments):

            if not isinstance(segment, dict):
                continue

            text = str(
                segment.get("text", "")
            ).strip()

            if not text:
                continue

            start = self._safe_float(
                segment.get("start", 0.0)
            )

            end = self._safe_float(
                segment.get("end", start)
            )

            if end < start:
                end = start

            sentences = self._split_sentences(text)

            if not sentences:
                continue

            # Estimate sentence timing within the original ASR segment.
            sentence_times = self._estimate_sentence_times(
                sentences=sentences,
                start=start,
                end=end,
            )

            for sentence, sentence_start, sentence_end in sentence_times:

                sentence_items.append(
                    {
                        "text": sentence,
                        "start": sentence_start,
                        "end": sentence_end,
                        "segment_index": segment_index,
                        "speaker": segment.get(
                            "speaker",
                            "user",
                        ),
                    }
                )

        return self._build_chunks(
            sentences=sentence_items,
            source_segments=segments,
        )

    def chunk_conversation(
        self,
        conversation: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Chunk a ConversationProcessor output.

        Returns the original conversation metadata plus a "chunks" field.
        """

        if not isinstance(conversation, dict):
            raise TypeError(
                "conversation must be a dictionary"
            )

        segments = conversation.get("segments", [])

        if segments:
            chunks = self.chunk_segments(segments)
        else:
            chunks = self.chunk(
                conversation.get("text", "")
            )

        result = conversation.copy()

        result["chunks"] = chunks
        result["chunk_count"] = len(chunks)

        return result

    # ------------------------------------------------------------------
    # Sentence splitting
    # ------------------------------------------------------------------

    def _split_sentences(
        self,
        text: str,
    ) -> List[str]:
        """
        Split text into approximate sentences.

        This is deliberately lightweight and dependency-free.

        It handles:
            - periods
            - question marks
            - exclamation marks
            - newlines

        It avoids splitting on decimal numbers such as:
            3.14

        It also avoids treating common abbreviations as sentence endings.
        """

        text = text.strip()

        if not text:
            return []

        # Normalize line breaks into sentence boundaries.
        text = re.sub(
            r"\n+",
            " ",
            text,
        )

        # Protect decimal numbers.
        text = re.sub(
            r"(?<=\d)\.(?=\d)",
            "<DECIMAL_POINT>",
            text,
        )

        # Protect common abbreviations.
        abbreviations = [
            "Mr.",
            "Mrs.",
            "Ms.",
            "Dr.",
            "Prof.",
            "Sr.",
            "Jr.",
            "St.",
            "vs.",
            "etc.",
            "e.g.",
            "i.e.",
        ]

        protected = {}

        for index, abbreviation in enumerate(abbreviations):

            token = f"<ABBR_{index}>"

            text = text.replace(
                abbreviation,
                token,
            )

            protected[token] = abbreviation

        # Sentence boundary after punctuation.
        text = re.sub(
            r"([.!?]+)(?=\s+|$)",
            r"\1< SENTENCE_BOUNDARY >",
            text,
        )

        # Newline-like separators that may remain.
        text = re.sub(
            r"\s*<\s*SENTENCE_BOUNDARY\s*>\s*",
            "\n",
            text,
        )

        sentences = [
            sentence.strip()
            for sentence in text.split("\n")
            if sentence.strip()
        ]

        # Restore abbreviations.
        restored = []

        for sentence in sentences:

            for token, abbreviation in protected.items():
                sentence = sentence.replace(
                    token,
                    abbreviation,
                )

            sentence = sentence.replace(
                "<DECIMAL_POINT>",
                ".",
            )

            if sentence.strip():
                restored.append(
                    sentence.strip()
                )

        # If sentence splitting produced nothing, preserve the text.
        if not restored and text.strip():
            return [text.strip()]

        return restored

    # ------------------------------------------------------------------
    # Timing
    # ------------------------------------------------------------------

    def _estimate_sentence_times(
        self,
        sentences: List[str],
        start: float,
        end: float,
    ) -> List[tuple]:
        """
        Estimate sentence timestamps based on relative word count.

        Whisper gives timing for the whole segment, not necessarily every
        sentence. This provides approximate timing without pretending that
        it is exact.
        """

        if not sentences:
            return []

        duration = max(
            0.0,
            end - start,
        )

        total_words = sum(
            self._word_count(sentence)
            for sentence in sentences
        )

        if total_words <= 0:
            return [
                (
                    sentence,
                    start,
                    end,
                )
                for sentence in sentences
            ]

        results = []

        current_time = start

        for sentence in sentences:

            sentence_words = self._word_count(
                sentence
            )

            fraction = (
                sentence_words / total_words
            )

            sentence_duration = (
                duration * fraction
            )

            sentence_start = current_time
            sentence_end = (
                current_time
                + sentence_duration
            )

            results.append(
                (
                    sentence,
                    sentence_start,
                    sentence_end,
                )
            )

            current_time = sentence_end

        return results

    # ------------------------------------------------------------------
    # Chunk construction
    # ------------------------------------------------------------------

    def _build_chunks(
        self,
        sentences: List[Any],
        source_segments: Optional[List[Dict[str, Any]]],
    ) -> List[Dict[str, Any]]:
        """
        Build chunks from sentence objects.

        The input may contain:

            str

        or:

            {
                "text": "...",
                "start": 0.0,
                "end": 2.0,
                ...
            }
        """

        if not sentences:
            return []

        normalized_sentences = []

        for item in sentences:

            if isinstance(item, str):

                text = item.strip()

                if not text:
                    continue

                normalized_sentences.append(
                    {
                        "text": text,
                        "start": None,
                        "end": None,
                        "segment_index": None,
                        "speaker": "user",
                    }
                )

            elif isinstance(item, dict):

                text = str(
                    item.get("text", "")
                ).strip()

                if not text:
                    continue

                normalized_sentences.append(
                    {
                        "text": text,
                        "start": item.get("start"),
                        "end": item.get("end"),
                        "segment_index": item.get(
                            "segment_index"
                        ),
                        "speaker": item.get(
                            "speaker",
                            "user",
                        ),
                    }
                )

        if not normalized_sentences:
            return []

        chunks = []
        current = []

        for sentence in normalized_sentences:

            if not current:
                current.append(sentence)
                continue

            candidate = current + [sentence]

            if self._fits(candidate):
                current.append(sentence)
                continue

            # Current chunk is full.
            chunks.append(
                self._create_chunk(
                    current,
                    len(chunks),
                )
            )

            # Carry a small amount of context into the next chunk.
            overlap = self._get_overlap(current)

            current = overlap + [sentence]

            # If overlap itself makes the new chunk too large,
            # remove overlap until it fits.
            while (
                len(current) > 1
                and not self._fits(current)
            ):
                current.pop(0)

        if current:
            chunks.append(
                self._create_chunk(
                    current,
                    len(chunks),
                )
            )

        chunks = self._merge_tiny_chunks(chunks)

        # Reassign IDs after merging.
        for index, chunk in enumerate(chunks):
            chunk["chunk_id"] = index

        return chunks

    def _fits(
        self,
        sentences: List[Dict[str, Any]],
    ) -> bool:
        """
        Determine whether a group of sentences fits the chunk limits.
        """

        text = self._join_sentences(sentences)

        word_count = self._word_count(text)
        character_count = len(text)

        if word_count > self.max_words:
            return False

        if character_count > self.max_characters:
            return False

        return True

    def _get_overlap(
        self,
        sentences: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Return the last N sentences for overlap.
        """

        if self.overlap_sentences <= 0:
            return []

        return sentences[
            -self.overlap_sentences:
        ]

    def _create_chunk(
        self,
        sentences: List[Dict[str, Any]],
        chunk_id: int,
    ) -> Dict[str, Any]:
        """
        Convert sentence objects into the final chunk structure.
        """

        text = self._join_sentences(sentences)

        start_values = [
            self._safe_float(item["start"])
            for item in sentences
            if item.get("start") is not None
        ]

        end_values = [
            self._safe_float(item["end"])
            for item in sentences
            if item.get("end") is not None
        ]

        start = (
            min(start_values)
            if start_values
            else None
        )

        end = (
            max(end_values)
            if end_values
            else None
        )

        duration = None

        if start is not None and end is not None:
            duration = max(
                0.0,
                end - start,
            )

        source_segment_ids = sorted(
            {
                item["segment_index"]
                for item in sentences
                if item.get("segment_index")
                is not None
            }
        )

        speakers = sorted(
            {
                item.get("speaker", "user")
                for item in sentences
                if item.get("speaker")
            }
        )

        return {
            "chunk_id": chunk_id,
            "text": text,
            "word_count": self._word_count(text),
            "character_count": len(text),
            "sentence_count": len(sentences),
            "start": start,
            "end": end,
            "duration": duration,
            "source_segment_ids": source_segment_ids,
            "speakers": speakers,
        }

    # ------------------------------------------------------------------
    # Tiny chunk handling
    # ------------------------------------------------------------------

    def _merge_tiny_chunks(
        self,
        chunks: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Merge very small final/standalone chunks where possible.

        This prevents embeddings from being generated for tiny fragments
        such as:

            "Yes."

        when there is a nearby chunk that can safely contain it.
        """

        if len(chunks) <= 1:
            return chunks

        result = []

        for chunk in chunks:

            if not result:
                result.append(chunk)
                continue

            previous = result[-1]

            if (
                chunk["word_count"]
                < self.min_chunk_words
            ):
                merged_text = (
                    previous["text"]
                    + " "
                    + chunk["text"]
                ).strip()

                if (
                    self._word_count(merged_text)
                    <= self.max_words
                    and len(merged_text)
                    <= self.max_characters
                ):
                    result[-1] = (
                        self._merge_chunks(
                            previous,
                            chunk,
                        )
                    )
                    continue

            result.append(chunk)

        return result

    def _merge_chunks(
        self,
        first: Dict[str, Any],
        second: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Merge two chunks.
        """

        text = (
            first["text"]
            + " "
            + second["text"]
        ).strip()

        start = self._earliest(
            first.get("start"),
            second.get("start"),
        )

        end = self._latest(
            first.get("end"),
            second.get("end"),
        )

        duration = None

        if start is not None and end is not None:
            duration = max(
                0.0,
                end - start,
            )

        source_segment_ids = sorted(
            set(
                first.get(
                    "source_segment_ids",
                    [],
                )
                + second.get(
                    "source_segment_ids",
                    [],
                )
            )
        )

        speakers = sorted(
            set(
                first.get("speakers", [])
                + second.get("speakers", [])
            )
        )

        return {
            "chunk_id": first.get("chunk_id", 0),
            "text": text,
            "word_count": self._word_count(text),
            "character_count": len(text),
            "sentence_count": (
                first.get("sentence_count", 0)
                + second.get("sentence_count", 0)
            ),
            "start": start,
            "end": end,
            "duration": duration,
            "source_segment_ids": source_segment_ids,
            "speakers": speakers,
        }

    # ------------------------------------------------------------------
    # Text utilities
    # ------------------------------------------------------------------

    @staticmethod
    def _join_sentences(
        sentences: List[Dict[str, Any]],
    ) -> str:
        """
        Join sentence text without modifying the content.
        """

        return " ".join(
            sentence["text"].strip()
            for sentence in sentences
            if sentence.get("text")
        ).strip()

    @staticmethod
    def _word_count(text: str) -> int:
        """
        Count words in a simple, model-friendly way.
        """

        if not text:
            return 0

        return len(
            re.findall(
                r"\S+",
                text,
            )
        )

    @staticmethod
    def _safe_float(value: Any) -> float:
        """
        Safely convert a value to float.
        """

        try:
            result = float(value)

            if result != result:
                return 0.0

            if result in (
                float("inf"),
                float("-inf"),
            ):
                return 0.0

            return result

        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def _earliest(
        first: Optional[float],
        second: Optional[float],
    ) -> Optional[float]:

        if first is None:
            return second

        if second is None:
            return first

        return min(first, second)

    @staticmethod
    def _latest(
        first: Optional[float],
        second: Optional[float],
    ) -> Optional[float]:

        if first is None:
            return second

        if second is None:
            return first

        return max(first, second)


# ----------------------------------------------------------------------
# Convenience function
# ----------------------------------------------------------------------

def chunk_text(
    text: str,
    max_words: int = 250,
) -> List[Dict[str, Any]]:
    """
    Convenience wrapper for chunking plain text.
    """

    chunker = SemanticChunker(
        max_words=max_words,
    )

    return chunker.chunk(text)


# ----------------------------------------------------------------------
# Local test
# ----------------------------------------------------------------------

if __name__ == "__main__":

    print("=" * 70)
    print("SEMANTIC CHUNKER TEST")
    print("=" * 70)

    text = (
        "I have been feeling tired lately. "
        "Work has been difficult. "
        "I am not sleeping very well. "
        "I keep thinking about everything that happened. "
        "Sometimes I just want to be alone. "
        "It has been difficult to concentrate during the day."
    )

    chunker = SemanticChunker(
        max_words=25,
        min_words=5,
        max_characters=250,
        overlap_sentences=1,
    )

    chunks = chunker.chunk(text)

    print(f"\nGenerated {len(chunks)} chunks:\n")

    for chunk in chunks:
        print("-" * 70)
        print(f"Chunk ID: {chunk['chunk_id']}")
        print(f"Words:    {chunk['word_count']}")
        print(f"Sentences:{chunk['sentence_count']}")
        print(f"Text:     {chunk['text']}")

    # --------------------------------------------------------------
    # Segment timing test
    # --------------------------------------------------------------

    print("\n" + "=" * 70)
    print("TIMED SEGMENT TEST")
    print("=" * 70)

    segments = [
        {
            "start": 0.0,
            "end": 4.0,
            "text": (
                "I have been feeling tired lately. "
                "Work has been difficult."
            ),
        },
        {
            "start": 4.5,
            "end": 8.0,
            "text": (
                "I am not sleeping very well. "
                "I keep thinking about everything."
            ),
        },
        {
            "start": 8.5,
            "end": 12.0,
            "text": (
                "Sometimes I just want to be alone."
            ),
        },
    ]

    timed_chunks = chunker.chunk_segments(
        segments
    )

    print(
        f"\nGenerated {len(timed_chunks)} "
        "timed chunks:\n"
    )

    for chunk in timed_chunks:
        print("-" * 70)
        print(f"Chunk ID:      {chunk['chunk_id']}")
        print(
            f"Time:          "
            f"{chunk['start']}s → {chunk['end']}s"
        )
        print(f"Duration:      {chunk['duration']}")
        print(f"Words:         {chunk['word_count']}")
        print(
            f"Source IDs:    "
            f"{chunk['source_segment_ids']}"
        )
        print(f"Text:          {chunk['text']}")

    # --------------------------------------------------------------
    # Conversation test
    # --------------------------------------------------------------

    print("\n" + "=" * 70)
    print("CONVERSATION TEST")
    print("=" * 70)

    conversation = {
        "session_id": "test-session-001",
        "created_at": "2026-01-01T12:00:00+00:00",
        "duration": 12.0,
        "segment_count": len(segments),
        "text": " ".join(
            segment["text"]
            for segment in segments
        ),
        "segments": segments,
    }

    result = chunker.chunk_conversation(
        conversation
    )

    print(
        f"\nConversation contains "
        f"{result['chunk_count']} chunks."
    )

    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)