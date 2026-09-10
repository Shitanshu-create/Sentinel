"""
Audio chunking utilities.

Responsible for:
- Receiving continuous microphone audio
- Accumulating audio into larger chunks
- Producing chunks suitable for transcription
- Managing maximum chunk duration
- Retaining overlap between chunks when needed
"""

from collections import deque #special python data strucutre (Pronounced as deck), it is usefull when you frequently add and remove items from the beginning or end.

import numpy as np


class AudioChunker:
    """
    Accumulates live audio into transcription-ready chunks.

    Example flow:

        0.5 sec audio
            ↓
        0.5 sec audio
            ↓
        0.5 sec audio
            ↓
        ...
            ↓
        5 sec chunk
            ↓
        Ready for Whisper
    """

    def __init__(
        self,
        sample_rate: int = 16000, #How many audio sample exist in 1 secound of audio
        chunk_duration: float = 5.0, #We want each transcription chunk to be 5 secound long
        overlap_duration: float = 0.5,#Gives the speech recognizer context around the boundary
        max_buffer_duration: float = 30.0, #Never allow more than 30 sec of audio to accumulate in memory. If the buffer exceeds this limit, the oldest audio is discarded.
    ):
        """
        Args:
            sample_rate:
                Audio sample rate.

            chunk_duration:
                Target duration of each transcription chunk
                in seconds.

            overlap_duration:
                Audio overlap retained between chunks.
                Helps avoid cutting words at chunk boundaries.

            max_buffer_duration:
                Maximum amount of audio allowed in memory.
        """

        self.sample_rate = sample_rate
        self.chunk_duration = chunk_duration
        self.overlap_duration = overlap_duration
        self.max_buffer_duration = max_buffer_duration

        self.target_samples = int(
            chunk_duration * sample_rate
        ) #80000 samples for 5 secound of audio at 16kHz

        self.overlap_samples = int(
            overlap_duration * sample_rate
        ) #Keep the last 8000 samples for 0.5 second of audio at 16kHz

        self.max_buffer_samples = int(
            max_buffer_duration * sample_rate
        ) #4800000 samples for 30 secound of audio at 16kHz

        # Store incoming audio blocks
        self.buffer = deque()

        # Track total samples currently buffered
        self.buffer_samples = 0


    def add_audio(
        self,
        audio: np.ndarray,
    ) -> None:
        """
        Add new audio to the buffer.

        Args:
            audio:
                Mono audio NumPy array.
        """

        if not isinstance(audio, np.ndarray):
            raise TypeError(
                "Audio must be a NumPy array."
            )

        if audio.size == 0:
            return

        # Ensure mono audio -> Convert multi-channel audio to mono
        if audio.ndim == 2:
            audio = np.mean(
                audio,
                axis=1,
            )

        if audio.ndim != 1:
            raise ValueError(
                f"Expected mono audio, got shape {audio.shape}"
            )

        # Convert to float32 -> because audio processing libraries often expect this format, and it ensures consistency in data type for downstream processing.

        audio = audio.astype(
            np.float32,
            copy=False,
        )

        # Add to buffer
        self.buffer.append(audio)
        self.buffer_samples += len(audio)

        # Prevent unlimited memory growth
        self._limit_buffer()


    def is_chunk_ready(self) -> bool:
        """
        Check whether enough audio has accumulated
        for a transcription chunk.
        """

        return self.buffer_samples >= self.target_samples


    def get_chunk(self) -> np.ndarray | None:
        """
        Return a transcription-ready audio chunk.

        Returns:
            Audio chunk if enough audio is available.
            Otherwise None.
        """

        if not self.is_chunk_ready():
            return None

        # Combine buffered blocks
        combined_audio = np.concatenate(
            list(self.buffer)
        ) #np.concatenate() expects something it can iterate over, so we convert deque to a list.

        # Extract target chunk
        chunk = combined_audio[
            :self.target_samples
        ] # Start at the beginning and take the first 80000 samples

        # Calculate remaining audio
        remaining_audio = combined_audio[
            self.target_samples:
        ]

        # Keep overlap from the end of the chunk
        if self.overlap_samples > 0:
            overlap = chunk[
                -self.overlap_samples:
            ]

            if len(remaining_audio) > 0:
                remaining_audio = np.concatenate(
                    [
                        overlap,
                        remaining_audio,
                    ]
                )
            else:
                remaining_audio = overlap

        # Reset buffer
        self.buffer.clear()
        self.buffer_samples = 0

        # Put remaining audio back
        if len(remaining_audio) > 0:
            self.buffer.append(
                remaining_audio
            )
            self.buffer_samples = len(
                remaining_audio
            )

        return chunk


    def flush(
        self,
        minimum_duration: float = 0.5,
    ) -> np.ndarray | None:
        """
        Return all remaining buffered audio.

        Useful when recording stops.

        Args:
            minimum_duration:
                Minimum duration required to return audio.

        Returns:
            Remaining audio or None.
        """

        if not self.buffer:
            return None

        minimum_samples = int(
            minimum_duration * self.sample_rate
        )

        if self.buffer_samples < minimum_samples:
            self.clear()
            return None

        audio = np.concatenate(
            list(self.buffer)
        )

        self.clear()

        return audio


    def _limit_buffer(self) -> None:

        """
        Prevent unlimited memory usage.

        Removes oldest audio if the buffer
        exceeds the configured maximum size.
        """

        # Underscore usually meanse that this is an internla/helper intended to be used as inside the class only, not to be called from outside the class.

        if self.buffer_samples <= self.max_buffer_samples:
            return

        combined_audio = np.concatenate(
            list(self.buffer)
        )

        # Keep newest audio only
        combined_audio = combined_audio[
            -self.max_buffer_samples:
        ]

        self.buffer.clear()
        self.buffer.append(combined_audio)

        self.buffer_samples = len(
            combined_audio
        )

    def get_buffer_duration(self) -> float:
        """
        Return current buffered audio duration.
        """

        return round(
            self.buffer_samples / self.sample_rate,
            3,
        )

    def clear(self) -> None:
        """
        Clear all buffered audio.
        """

        self.buffer.clear()
        self.buffer_samples = 0


if __name__ == "__main__":

    print("Testing Audio Chunker")

    sample_rate = 16000

    chunker = AudioChunker(
        sample_rate=sample_rate,
        chunk_duration=5.0,
        overlap_duration=0.5,
    )

    # Simulate microphone blocks
    block_duration = 0.5
    block_samples = int(
        sample_rate * block_duration
    )

    for index in range(12):

        # Simulated microphone audio
        audio_block = np.random.uniform(
            -0.5,
            0.5,
            block_samples,
        ).astype(np.float32)

        chunker.add_audio(audio_block)

        print(
            f"Block {index + 1} added | "
            f"Buffer: "
            f"{chunker.get_buffer_duration()} sec"
        )

        if chunker.is_chunk_ready():

            chunk = chunker.get_chunk()

            print(
                f"\nChunk created!"
            )

            print(
                f"Chunk duration: "
                f"{len(chunk) / sample_rate:.2f} sec\n"
            )

    # Flush remaining audio
    remaining = chunker.flush()

    if remaining is not None:
        print(
            "Remaining chunk duration: "
            f"{len(remaining) / sample_rate:.2f} sec"
        )