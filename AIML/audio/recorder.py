"""
Live microphone audio recorder.

Responsible for:
- Capturing audio from the microphone
- Buffering incoming audio
- Starting and stopping recordings
- Returning recorded audio as NumPy arrays
- Saving recordings as WAV files for debugging/testing
"""

from __future__ import annotations #This is realted to type hinting and allows for forward references in type annotations.

import queue #FIFO
from pathlib import Path #Helps working with file paths in a platfrom-independent way.
from typing import Optional #Thus value can have a specific type or be None.

import numpy as np 
import sounddevice as sd #Allow python to interact with audio devices, such as microphones and speakers.
import soundfile as sf #Used to read and write audio files in various formats, including WAV, FLAC, and OGG.


class AudioRecorder:
    """
    Handles live microphone recording.

    Example:
        recorder = AudioRecorder()

        recorder.start()
        input("Press Enter to stop...")
        recorder.stop()

        audio = recorder.get_audio()
    """

    def __init__(
        self,
        sample_rate: int = 16000,
        channels: int = 1, 
        dtype: str = "float32", 
        device: Optional[int | str] = None,
    ):
        """
        Initialize the audio recorder.

        Args:
            sample_rate: Audio sample rate in Hz.
                         16000 Hz works well for speech recognition.
            channels: Number of audio channels.
                      1 = mono, recommended for speech.
            dtype: Audio data type.
            device: Microphone device ID or name.
                    None uses the system default microphone.
        """

        self.sample_rate = sample_rate
        self.channels = channels
        self.dtype = dtype
        self.device = device

        # Stores audio blocks received from microphone, usefull for real time processing later.
        self.audio_queue = queue.Queue()

        # Stores complete recording
        self.audio_chunks: list[np.ndarray] = []

        # This variable will store the microphone stream
        self.stream: Optional[sd.InputStream] = None

        # Recording state
        self.is_recording = False


    @staticmethod #Belongs to a class but does not require an object
    def list_devices() -> None:
        """Print all available audio devices."""

        print("\nAVAILABLE AUDIO DEVICES")
        print("-" * 60)

        devices = sd.query_devices() # Ask operating system for a list of all audio devices, including microphones and speakers.

        for index, device in enumerate(devices):
            if device["max_input_channels"] > 0: #Can this device be used for recording audio? If yes, print its details.
                print(
                    f"[{index}] "
                    f"{device['name']} "
                    f"(Input Channels: {device['max_input_channels']})"
                )

        print("-" * 60)

    def get_device_info(self) -> dict:
        """Return information about the selected microphone."""

        device_info = sd.query_devices(
            self.device,
            kind="input",
        )

        return {
            "name": device_info["name"],
            "sample_rate": device_info["default_samplerate"],
            "max_input_channels": device_info["max_input_channels"],
        }

    def _audio_callback(
        self,
        indata: np.ndarray, #Contain actual audio data from the microphone.
        frames: int, #Number of frames in the current audio block.
        time,
        status,
    ) -> None:
        """
        Called automatically whenever microphone audio is received.

        Audio arrives continuously in small blocks.
        """

        if status:
            print(f"Audio stream warning: {status}")

        # Copy audio because sounddevice reuses the input buffer
        audio_chunk = indata.copy()

        # Store chunk in queue for real-time processing later
        self.audio_queue.put(audio_chunk)

        # Store chunk for complete recording
        if self.is_recording:
            self.audio_chunks.append(audio_chunk)


    def start(self, block_duration: float = 0.5) -> None:
        """
        Start microphone recording.

        Args:
            block_duration:
                Duration of each incoming audio block in seconds.
                Smaller blocks reduce latency but increase processing overhead.
        """

        #Microphone audio is delivered approximately every half second, which is a good balance between latency and performance.

        if self.is_recording:
            print("Recording is already running.")
            return

        # Clear previous recording
        self.audio_chunks = []

        # Clear queue
        while not self.audio_queue.empty(): #While the queue still has audio chunks
            try:
                self.audio_queue.get_nowait() #Remove an item immediately without waiting.
            except queue.Empty: #If the queue is unespectedly become empty stop the loop
                break

        block_size = int(self.sample_rate * block_duration)

        try:
            #Below creates a new microphone input stream with the specified parameters and connects it to the _audio_callback method, which will be called whenever new audio data is available.

            self.stream = sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channels, #If none then default is used
                dtype=self.dtype,
                device=self.device,
                blocksize=block_size,
                callback=self._audio_callback, #connects microphone to your function
            )

            self.is_recording = True
            self.stream.start() #After this microphone audio will start being captured and sent to the _audio_callback method.

            print("Microphone recording started.")

        except Exception as error:
            self.is_recording = False
            self.stream = None

            raise RuntimeError(
                f"Could not start microphone recording: {error}"
            )

    def stop(self) -> None:
        """Stop microphone recording."""

        if not self.is_recording:
            print("Recording is not running.")
            return

        self.is_recording = False

        if self.stream is not None:

            try:
                self.stream.stop()
                self.stream.close()

            finally:
                self.stream = None

        print("Microphone recording stopped.")


    #Audio Retrieval and Saving Methods
    def get_audio(self) -> np.ndarray:
        """
        Return the complete recorded audio.

        Returns:
            NumPy array containing all recorded audio samples.

        Raises:
            RuntimeError if no audio has been recorded.
        """

        if not self.audio_chunks:
            raise RuntimeError("No audio has been recorded.")

        return np.concatenate(
            self.audio_chunks,
            axis=0, #Means that the audio chunks will be combined along the first axis, which corresponds to the time dimension in a 1D audio signal.
        )

    def get_next_chunk(
        self,
        timeout: Optional[float] = None,
    ) -> Optional[np.ndarray]:
        """
        Get the next live audio chunk.
        Useful later for real-time transcription.

        Args:
            timeout: Maximum time to wait for audio.

        Returns:
            Audio chunk or None if timeout occurs.
        """

        try:
            return self.audio_queue.get(timeout=timeout) #Retrieve the next audio chunk from the queue, waiting up to timeout secounds if necessary. If no audio chunk is available within the specified timeout, it will raise a queue.Empty expection, which is caught and handled by returning None.

        except queue.Empty:
            return None

    def get_recording_duration(self) -> float:
        """
        Return the duration of the recorded audio in seconds.
        """

        if not self.audio_chunks:
            return 0.0

        total_frames = sum(
            len(chunk)
            for chunk in self.audio_chunks
        )

        return round(
            total_frames / self.sample_rate,
            2,
        )


    def save_wav(
        self,
        output_path: str | Path,
    ) -> Path:
        """
        Save the current recording as a WAV file.

        Useful for:
        - Debugging
        - Testing Whisper
        - Inspecting audio quality

        Args:
            output_path: Destination WAV file path.

        Returns:
            Path to saved audio file.
        """

        audio = self.get_audio() #This get all the recorded audio chunks and concatenates them into a single NumPy array.

        output_path = Path(output_path)

        # Create parent directory if needed
        output_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        sf.write(
            output_path,
            audio,
            self.sample_rate,
        )

        print(f"Audio saved: {output_path}")

        return output_path


    def close(self) -> None:
        """Cleanly close the recorder."""

        if self.is_recording:
            self.stop()

        # Clear memory buffers
        self.audio_chunks = []

        while not self.audio_queue.empty():
            try:
                self.audio_queue.get_nowait()
            except queue.Empty:
                break


    def __enter__(self):
        """Enable use with 'with' statements."""
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """Ensure microphone is closed."""
        self.close()



if __name__ == "__main__":

    AudioRecorder.list_devices()
    print("Testing Audio Recorder")
    recorder = AudioRecorder(
        sample_rate=16000,
        channels=1,
    )


    try:
        recorder.start()

        input("\nRecording... Press ENTER to stop.\n")

        recorder.stop()

        audio = recorder.get_audio()

        print("\nRecording Information")
        print("-" * 40)
        print(f"Audio Shape: {audio.shape}")
        print(
            f"Duration: "
            f"{recorder.get_recording_duration()} seconds"
        )
        
        # Save test recording
        recorder.save_wav(
            "storage/temp/test_recording.wav"
        )

    finally:
        recorder.close()