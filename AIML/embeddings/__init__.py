"""Ollama-backed embedding generation and local vector storage."""

from .embedding_processor import EmbeddingProcessor
from .embedding_service import EmbeddingService
from .model_loader import OllamaEmbeddingModelLoader

__all__ = ["EmbeddingProcessor", "EmbeddingService", "OllamaEmbeddingModelLoader"]
