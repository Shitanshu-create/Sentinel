"""
Audio preprocessing utilities.

Responsible for preparing raw microphone audio before it is sent to:
- Voice Activity Detection (VAD)
- Chunking
- Whisper transcription
"""

import numpy as np


class AudioPreprocessor:
    """
    Preprocess microphone audio for speech recognition.
    """

    def __init__(
        self,
        normalize: bool = True,
        remove_dc_offset: bool = True,
    ):
        """
        Args:
            normalize: Normalize audio volume.
            remove_dc_offset: Remove DC offset from audio.
        """

        self.normalize = normalize
        self.remove_dc_offset = remove_dc_offset

    def preprocess(self, audio: np.ndarray) -> np.ndarray:
        """
        Run the complete preprocessing pipeline.

        Args:
            audio: Raw audio NumPy array.

        Returns:
            Cleaned audio as float32 NumPy array.
        """

        # Validate input
        self._validate_audio(audio)

        # Convert to float32
        processed_audio = audio.astype(np.float32)

        # Convert stereo to mono if needed
        processed_audio = self._to_mono(processed_audio)

        # Remove DC offset
        if self.remove_dc_offset:
            processed_audio = self._remove_dc_offset(
                processed_audio
            )

        # Normalize volume
        if self.normalize:
            processed_audio = self._normalize(
                processed_audio
            )

        # Prevent invalid values
        processed_audio = np.nan_to_num(
            processed_audio,
            nan=0.0,
            posinf=0.0,
            neginf=0.0,
        )

        # Ensure values stay within valid range
        processed_audio = np.clip(
            processed_audio,
            -1.0,
            1.0,
        )

        return processed_audio

    @staticmethod
    def _validate_audio(audio: np.ndarray) -> None:
        """
        Validate that the input is usable audio.
        """

        if not isinstance(audio, np.ndarray):
            raise TypeError(
                "Audio must be a NumPy array."
            )

        if audio.size == 0:
            raise ValueError(
                "Audio array is empty."
            )

    @staticmethod
    def _to_mono(audio: np.ndarray) -> np.ndarray:
        """
        Convert multi-channel audio to mono.

        Expected shapes:

        Mono:
            (samples,)

        Multi-channel:
            (samples, channels)
        """

        if audio.ndim == 1:
            return audio

        if audio.ndim == 2:
            return np.mean(
                audio,
                axis=1,
            )

        raise ValueError(
            f"Unsupported audio shape: {audio.shape}"
        )

    @staticmethod
    def _remove_dc_offset(
        audio: np.ndarray,
    ) -> np.ndarray:
        """
        Remove DC offset.

        DC offset occurs when the audio waveform
        is shifted away from zero.
        """

        return audio - np.mean(audio)

    @staticmethod
    def _normalize(
        audio: np.ndarray,
        target_peak: float = 0.95,
    ) -> np.ndarray:
        """
        Normalize audio volume based on peak amplitude.

        Args:
            audio: Input audio.
            target_peak: Maximum desired amplitude.

        Returns:
            Normalized audio.
        """

        peak = np.max(np.abs(audio))

        # Avoid division by zero for silent audio
        if peak == 0:
            return audio

        return audio * (target_peak / peak)


if __name__ == "__main__":

    print("Testing Audio Preprocessor")

    # Create example stereo audio
    sample_audio = np.random.uniform(
        -0.5,
        0.5,
        size=(16000, 2),
    ).astype(np.float32)

    preprocessor = AudioPreprocessor()

    processed_audio = preprocessor.preprocess(
        sample_audio
    )

    print("\nPreprocessing Complete")
    print(f"Original Shape: {sample_audio.shape}")
    print(f"Processed Shape: {processed_audio.shape}")
    print(f"Data Type: {processed_audio.dtype}")
    print(
        f"Min Value: {processed_audio.min():.4f}"
    )
    print(
        f"Max Value: {processed_audio.max():.4f}"
    )