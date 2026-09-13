"""
Faster-Whisper transcription service.

Responsible for:
- Receiving audio data
- Sending audio to Faster-Whisper
- Performing transcription
- Returning structured transcription results
"""

from __future__ import annotations

from typing import Any

import numpy as np

from .model_loader import WhisperModelLoader


class WhisperService:
    """
    Handles audio transcription using Faster-Whisper.

    Example:
        loader = WhisperModelLoader(model_name="base")
        service = WhisperService(loader)

        result = service.transcribe(audio)
        print(result["text"])
    """

    def __init__(
        self,
        model_loader: WhisperModelLoader,
        language: str | None = None,
    ):
        """
        Args:
            model_loader:
                Initialized WhisperModelLoader instance.

            language:
                Language code for transcription.

                Examples:
                - "en" for English
                - "hi" for Hindi

                If None, Faster-Whisper automatically
                detects the language.
        """

        self.model_loader = model_loader
        self.language = language

        # Loading can download/allocate a sizeable model, so defer it until a
        # transcription request actually arrives.
        self.model = None

    # ------------------------------------------------------------------
    # AUDIO PREPARATION
    # ------------------------------------------------------------------

    @staticmethod
    def _prepare_audio(
        audio: np.ndarray,
    ) -> np.ndarray:
        """
        Prepare audio before transcription.

        Faster-Whisper expects:
        - NumPy array
        - Mono audio
        - Float32
        """

        if not isinstance(audio, np.ndarray):
            raise TypeError(
                "Audio must be provided as a NumPy array."
            )

        if audio.size == 0:
            raise ValueError(
                "Cannot transcribe empty audio."
            )

        # Convert stereo to mono
        if audio.ndim == 2:
            audio = np.mean(
                audio,
                axis=1,
            )

        if audio.ndim != 1:
            raise ValueError(
                f"Expected mono audio, got shape {audio.shape}"
            )

        # Convert to float32
        audio = audio.astype(
            np.float32,
            copy=False,
        )

        # Replace invalid values
        audio = np.nan_to_num(
            audio,
            nan=0.0,
            posinf=0.0,
            neginf=0.0,
        )

        return audio

    # ------------------------------------------------------------------
    # TRANSCRIPTION
    # ------------------------------------------------------------------

    def transcribe(
        self,
        audio: np.ndarray,
        beam_size: int = 5,
        vad_filter: bool = False,
    ) -> dict[str, Any]:
        """
        Transcribe audio using Faster-Whisper.

        Args:
            audio:
                Mono float32 NumPy audio array.

            beam_size:
                Beam search size.
                Higher values may improve accuracy but
                increase processing time.

            vad_filter:
                Enable Faster-Whisper's built-in VAD filter.

        Returns:
            Dictionary containing transcription results.
        """

        audio = self._prepare_audio(audio)

        try:
            if self.model is None:
                self.model = self.model_loader.load_model()
            segments, info = self.model.transcribe(
                audio,
                language=self.language,
                beam_size=beam_size,
                vad_filter=vad_filter,
            )

            transcript_segments = []
            full_text_parts = []

            # Faster-Whisper returns a generator,
            # so we must iterate through all segments.
            for segment in segments:

                text = segment.text.strip()

                if text:
                    transcript_segments.append(
                        {
                            "start": round(segment.start, 2),
                            "end": round(segment.end, 2),
                            "text": text,
                        }
                    )

                    full_text_parts.append(text)

            full_text = " ".join(full_text_parts)

            return {
                "text": full_text,
                "segments": transcript_segments,
                "language": info.language,
                "language_probability": round(
                    info.language_probability,
                    4,
                ),
                "duration": round(
                    info.duration,
                    2,
                ),
            }

        except Exception as error:
            raise RuntimeError(
                f"Transcription failed: {error}"
            )

    # ------------------------------------------------------------------
    # SIMPLE TRANSCRIPTION
    # ------------------------------------------------------------------

    def transcribe_text(
        self,
        audio: np.ndarray,
    ) -> str:
        """
        Transcribe audio and return only text.

        Useful for simple real-time pipelines.
        """

        result = self.transcribe(audio)

        return result["text"]


# ======================================================================
# TEST
# ======================================================================

if __name__ == "__main__":

    print("=" * 60)
    print("WHISPER SERVICE TEST")
    print("=" * 60)

    # Create loader
    loader = WhisperModelLoader(
        model_name="base",
    )

    # Create transcription service
    service = WhisperService(
        model_loader=loader,
        language="en",
    )

    # Create example audio
    # This is silence, so actual transcription will likely be empty.
    sample_rate = 16000
    test_audio = np.zeros(
        sample_rate * 5,
        dtype=np.float32,
    )

    print("\nTesting transcription...")

    result = service.transcribe(
        test_audio,
    )

    print("\nTRANSCRIPTION RESULT")
    print("-" * 60)
    print(f"Text: {result['text']}")
    print(f"Language: {result['language']}")
    print(f"Duration: {result['duration']}")
