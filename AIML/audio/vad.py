"""
Voice Activity Detection (VAD).

Responsible for determining whether an audio chunk
contains speech or silence/background noise.
"""

import numpy as np


class VoiceActivityDetector:
    """
    Simple energy-based Voice Activity Detector.

    Designed for live microphone audio.
    """

    def __init__(
        self,
        energy_threshold: float = 0.01,
        min_speech_duration: float = 0.3,
        sample_rate: int = 16000,
    ):
        """
        Args:
            energy_threshold:
                Minimum RMS energy required to consider
                audio as active speech.

            min_speech_duration:
                Minimum duration of audio required before
                accepting it as speech.

            sample_rate:
                Audio sample rate.
        """

        self.energy_threshold = energy_threshold
        self.min_speech_duration = min_speech_duration
        self.sample_rate = sample_rate

    def calculate_energy(self, audio: np.ndarray) -> float:
        """
        Calculate RMS energy of an audio chunk.

        RMS energy gives a simple measurement of
        how loud or active an audio signal is.
        """

        if audio.size == 0:
            return 0.0

        return float(
            np.sqrt(
                np.mean(
                    np.square(audio)
                )
            )
        )

    def get_duration(self, audio: np.ndarray) -> float:
        """
        Calculate audio duration in seconds.
        """

        if audio.size == 0:
            return 0.0

        return len(audio) / self.sample_rate

    def is_speech(self, audio: np.ndarray) -> bool:
        """
        Determine whether an audio chunk likely contains speech.

        Uses:
        1. Minimum duration check
        2. RMS energy threshold

        Returns:
            True if speech is likely present.
            False otherwise.
        """

        if not isinstance(audio, np.ndarray):
            raise TypeError(
                "Audio must be a NumPy array."
            )

        if audio.size == 0:
            return False

        # Convert stereo to mono if needed
        if audio.ndim == 2:
            audio = np.mean(audio, axis=1)

        # Check minimum duration
        duration = self.get_duration(audio)

        if duration < self.min_speech_duration:
            return False

        # Calculate audio energy
        energy = self.calculate_energy(audio)

        # Determine activity
        return energy >= self.energy_threshold

    def analyze(self, audio: np.ndarray) -> dict:
        """
        Analyze an audio chunk and return detailed information.

        Useful for debugging and tuning thresholds.
        """

        duration = self.get_duration(audio)
        energy = self.calculate_energy(audio)

        speech_detected = (
            duration >= self.min_speech_duration
            and energy >= self.energy_threshold
        )

        return {
            "speech_detected": speech_detected,
            "duration_seconds": round(duration, 3),
            "energy": round(energy, 6),
            "energy_threshold": self.energy_threshold,
        }


if __name__ == "__main__":

    print("Testing Voice Activity Detector")

    sample_rate = 16000

    # Simulated silence
    silence = np.zeros(sample_rate)

    # Simulated audio activity
    active_audio = np.random.uniform(
        -0.5,
        0.5,
        sample_rate,
    ).astype(np.float32)

    vad = VoiceActivityDetector(
        energy_threshold=0.01,
        sample_rate=sample_rate,
    )

    print("\nSilence:")
    print(vad.analyze(silence))

    print("\nActive Audio:")
    print(vad.analyze(active_audio))