"""Lazy loader for an Ollama embedding model."""

from __future__ import annotations

import os
from typing import Any


class OllamaEmbeddingModelLoader:
    """Create and cache an Ollama client used for embedding requests.

    The model itself is served by a local Ollama daemon.  Pull it once with::

        ollama pull nomic-embed-text
    """

    def __init__(
        self,
        model_name: str = "nomic-embed-text",
        host: str | None = None,
    ) -> None:
        self.model_name = model_name
        self.host = host or os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self._client: Any | None = None

    def load_model(self) -> Any:
        """Return a cached Ollama client without making an embedding request."""
        if self._client is not None:
            return self._client

        try:
            from ollama import Client
        except ImportError as error:
            raise RuntimeError(
                "The Ollama Python package is not installed. "
                "Install it with: pip install ollama"
            ) from error

        self._client = Client(host=self.host)
        return self._client

    def is_loaded(self) -> bool:
        return self._client is not None

    def unload_model(self) -> None:
        """Release the cached client reference.

        This does not unload the model from the Ollama server.
        """
        self._client = None
