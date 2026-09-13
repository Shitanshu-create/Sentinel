"""
Whisper model loader.

Responsible for:
- Loading the Whisper model
- Selecting CUDA or CPU
- Keeping the model cached in memory
"""

import torch


class WhisperModelLoader:
    """
    Loads and manages the Whisper model.
    """

    def __init__(
        self,
        model_name: str = "base",
        device: str | None = None,
    ):
        """
        Args:
            model_name:
                Whisper model size.

                Available:
                - tiny
                - base
                - small
                - medium
                - large

            device:
                Compute device.
                If None, automatically selects CUDA if available.
        """

        self.model_name = model_name

        # Automatically select device
        if device is None:
            self.device = (
                "cuda"
                if torch.cuda.is_available()
                else "cpu"
            )
        else:
            self.device = device

        self.model = None
        self.compute_type = "float16" if self.device == "cuda" else "int8"

    def load_model(self):
        """
        Load the Whisper model.

        Returns:
            Loaded Whisper model.
        """

        # Return existing model if already loaded
        if self.model is not None:
            return self.model

        print(
            f"Loading Whisper model: "
            f"{self.model_name}"
        )

        print(
            f"Using device: "
            f"{self.device}"
        )

        try:
            from faster_whisper import WhisperModel

            self.model = WhisperModel(
                self.model_name,
                device=self.device,
                compute_type=self.compute_type,
            )

            print("Whisper model loaded successfully.")

            return self.model

        except Exception as error:
            raise RuntimeError(
                f"Failed to load Whisper model: {error}"
            )

    def is_loaded(self) -> bool:
        """
        Check whether the model is loaded.
        """

        return self.model is not None

    def unload_model(self) -> None:
        """
        Remove model from memory.

        Useful when switching models or shutting down.
        """

        if self.model is None:
            return

        print("Unloading Whisper model...")

        del self.model
        self.model = None

        # Clear CUDA memory if using GPU
        if self.device == "cuda":
            torch.cuda.empty_cache()

        print("Whisper model unloaded.")

    def get_device(self) -> str:
        """
        Return the active compute device.
        """

        return self.device


if __name__ == "__main__":

    print("Testing Whisper Model Loader")

    loader = WhisperModelLoader(
        model_name="base",
    )

    model = loader.load_model()

    print("\nModel Information")
    print("-" * 40)
    print(f"Model: {loader.model_name}")
    print(f"Device: {loader.get_device()}")
    print(f"Loaded: {loader.is_loaded()}")

    # Uncomment if you want to test unloading
    # loader.unload_model()
