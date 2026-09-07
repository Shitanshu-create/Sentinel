"""
Transcript builder.

Responsible for:
- Receiving transcription results from Whisper
- Building a continuous transcript
- Storing transcript segments
- Managing timestamps
- Providing complete transcript output
"""

from __future__ import annotations

from datetime import datetime
from typing import Any


class TranscriptBuilder:
    """
    Builds and manages a continuous transcript from
    multiple transcription chunks.
    """

    def __init__(self):
        """Initialize an empty transcript."""

        self.segments: list[dict[str, Any]] = []
        self.created_at = datetime.now().isoformat()

    # ------------------------------------------------------------------
    # ADD TRANSCRIPTION
    # ------------------------------------------------------------------

    def add_transcription(
        self,
        transcription_result: dict[str, Any],
        chunk_offset: float = 0.0,
    ) -> None:
        """
        Add a Whisper transcription result.

        Args:
            transcription_result:
                Result returned from WhisperService.

            chunk_offset:
                Time offset of this audio chunk in the
                overall recording.
        """

        segments = transcription_result.get(
            "segments",
            [],
        )

        for segment in segments:

            text = segment.get(
                "text",
                "",
            ).strip()

            # Ignore empty segments
            if not text:
                continue

            transcript_segment = {
                "start": round(
                    segment["start"] + chunk_offset,
                    2,
                ),
                "end": round(
                    segment["end"] + chunk_offset,
                    2,
                ),
                "text": text,
            }

            self.segments.append(
                transcript_segment
            )

    # ------------------------------------------------------------------
    # ADD SIMPLE TEXT
    # ------------------------------------------------------------------

    def add_text(
        self,
        text: str,
        start: float | None = None,
        end: float | None = None,
    ) -> None:
        """
        Manually add text to the transcript.

        Useful when only plain text is available.
        """

        text = text.strip()

        if not text:
            return

        self.segments.append(
            {
                "start": start,
                "end": end,
                "text": text,
            }
        )

    # ------------------------------------------------------------------
    # GET FULL TEXT
    # ------------------------------------------------------------------

    def get_full_text(self) -> str:
        """
        Return the complete transcript as plain text.
        """

        return " ".join(
            segment["text"]
            for segment in self.segments
        )

    # ------------------------------------------------------------------
    # GET SEGMENTS
    # ------------------------------------------------------------------

    def get_segments(self) -> list[dict[str, Any]]:
        """
        Return all transcript segments.
        """

        return self.segments.copy()

    # ------------------------------------------------------------------
    # GET LATEST TEXT
    # ------------------------------------------------------------------

    def get_latest_text(
        self,
        count: int = 1,
    ) -> str:
        """
        Return text from the latest segments.

        Args:
            count:
                Number of recent segments to return.
        """

        if not self.segments:
            return ""

        recent_segments = self.segments[-count:]

        return " ".join(
            segment["text"]
            for segment in recent_segments
        )

    # ------------------------------------------------------------------
    # TRANSCRIPT INFORMATION
    # ------------------------------------------------------------------

    def get_duration(self) -> float:
        """
        Get approximate total transcript duration.
        """

        if not self.segments:
            return 0.0

        end_times = [
            segment["end"]
            for segment in self.segments
            if segment["end"] is not None
        ]

        if not end_times:
            return 0.0

        return round(
            max(end_times),
            2,
        )

    def get_segment_count(self) -> int:
        """
        Return number of transcript segments.
        """

        return len(self.segments)

    # ------------------------------------------------------------------
    # EXPORT
    # ------------------------------------------------------------------

    def build(self) -> dict[str, Any]:
        """
        Build the complete structured transcript.

        This is the main output method.
        """

        return {
            "created_at": self.created_at,
            "duration": self.get_duration(),
            "segment_count": self.get_segment_count(),
            "text": self.get_full_text(),
            "segments": self.get_segments(),
        }

    # ------------------------------------------------------------------
    # RESET
    # ------------------------------------------------------------------

    def clear(self) -> None:
        """
        Clear the current transcript.
        """

        self.segments = []
        self.created_at = datetime.now().isoformat()


# ======================================================================
# TEST
# ======================================================================

if __name__ == "__main__":

    builder = TranscriptBuilder()

    # Simulated Whisper results
    transcription_1 = {
        "text": "I have been feeling stressed.",
        "segments": [
            {
                "start": 0.0,
                "end": 2.5,
                "text": "I have been feeling stressed.",
            }
        ],
    }

    transcription_2 = {
        "text": "For the past few weeks.",
        "segments": [
            {
                "start": 0.0,
                "end": 2.0,
                "text": "For the past few weeks.",
            }
        ],
    }

    builder.add_transcription(
        transcription_1,
        chunk_offset=0.0,
    )

    builder.add_transcription(
        transcription_2,
        chunk_offset=2.5,
    )

    result = builder.build()

    print("\nTRANSCRIPT")
    print("-" * 50)

    print(f"Text: {result['text']}")
    print(f"Duration: {result['duration']} seconds")
    print(f"Segments: {result['segment_count']}")

    print("\nSEGMENTS:")

    for segment in result["segments"]:
        print(
            f"[{segment['start']} - {segment['end']}] "
            f"{segment['text']}"
        )