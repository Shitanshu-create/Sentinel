"""Embedding generation through Ollama's ``nomic-embed-text`` model."""

from __future__ import annotations

from collections.abc import Sequence

from .model_loader import OllamaEmbeddingModelLoader


class EmbeddingService:
    """Generate one vector per non-empty text value."""

    def __init__(self, model_loader: OllamaEmbeddingModelLoader | None = None) -> None:
        self.model_loader = model_loader or OllamaEmbeddingModelLoader()

    @staticmethod
    def _validate_texts(texts: Sequence[str]) -> list[str]:
        if isinstance(texts, (str, bytes)):
            raise TypeError("texts must be a sequence of strings, not one string.")
        if not texts:
            raise ValueError("At least one text value is required.")

        prepared: list[str] = []
        for index, value in enumerate(texts):
            if not isinstance(value, str):
                raise TypeError(f"Text at index {index} must be a string.")
            value = value.strip()
            if not value:
                raise ValueError(f"Text at index {index} is empty.")
            prepared.append(value)
        return prepared

    def embed_texts(self, texts: Sequence[str]) -> list[list[float]]:
        """Embed texts in a single Ollama request and return JSON-safe vectors."""
        prepared = self._validate_texts(texts)
        client = self.model_loader.load_model()

        try:
            response = client.embed(model=self.model_loader.model_name, input=prepared)
            vectors = response["embeddings"]
        except Exception as error:
            raise RuntimeError(
                "Could not create embeddings. Ensure Ollama is running and "
                f"the '{self.model_loader.model_name}' model is installed. "
                "Run: ollama pull nomic-embed-text"
            ) from error

        if len(vectors) != len(prepared):
            raise RuntimeError("Ollama returned a different number of embeddings than inputs.")

        return [[float(value) for value in vector] for vector in vectors]

    def embed_text(self, text: str) -> list[float]:
        """Embed one text value."""
        return self.embed_texts([text])[0]
