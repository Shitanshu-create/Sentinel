"""Create embeddings and persist them under ``storage/embeddings``."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

import numpy as np

from .embedding_service import EmbeddingService


DEFAULT_STORAGE_DIR = Path(__file__).resolve().parents[2] / "storage" / "embeddings"


class EmbeddingProcessor:
    """Coordinates generation and durable local storage of text embeddings.

    Every record is stored as ``<id>.npy`` and indexed by ``index.json``.  The
    vector file is kept separately so the manifest stays easy to inspect.
    """

    def __init__(
        self,
        embedding_service: EmbeddingService | None = None,
        storage_dir: str | Path = DEFAULT_STORAGE_DIR,
    ) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self.storage_dir = Path(storage_dir)
        self.index_path = self.storage_dir / "index.json"

    def create_embeddings(
        self,
        texts: list[str],
        document_ids: list[str] | None = None,
        metadata: list[dict[str, Any] | None] | None = None,
    ) -> list[dict[str, Any]]:
        """Embed and persist texts, returning records without raw vectors."""
        if document_ids is not None and len(document_ids) != len(texts):
            raise ValueError("document_ids must have the same length as texts.")
        if metadata is not None and len(metadata) != len(texts):
            raise ValueError("metadata must have the same length as texts.")

        record_ids = document_ids or [uuid4().hex for _ in texts]
        record_ids = [self._validate_document_id(record_id) for record_id in record_ids]
        if len(set(record_ids)) != len(record_ids):
            raise ValueError("document_ids must be unique within a batch.")

        vectors = self.embedding_service.embed_texts(texts)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        index = self._read_index()
        records: list[dict[str, Any]] = []

        for position, (text, vector) in enumerate(zip(texts, vectors, strict=True)):
            record_id = record_ids[position]
            if any(item["id"] == record_id for item in index):
                raise ValueError(f"An embedding already exists for ID '{record_id}'.")

            vector_path = self.storage_dir / f"{record_id}.npy"

            np.save(vector_path, np.asarray(vector, dtype=np.float32))
            record = {
                "id": record_id,
                "text": text,
                "vector_file": vector_path.name,
                "dimensions": len(vector),
                "metadata": metadata[position] if metadata else {},
                "created_at": datetime.now(UTC).isoformat(),
            }
            index.append(record)
            records.append(record)

        self._write_index(index)
        return records

    def _validate_document_id(self, document_id: str) -> str:
        if not isinstance(document_id, str) or not document_id.strip():
            raise ValueError("Each document ID must be a non-empty string.")
        document_id = document_id.strip()
        vector_path = self.storage_dir / f"{document_id}.npy"
        # Prevent IDs such as '../file' from escaping the storage directory.
        if vector_path.parent.resolve() != self.storage_dir.resolve():
            raise ValueError("Document IDs cannot contain path components.")
        return document_id

    def get_embedding(self, document_id: str) -> np.ndarray:
        """Load a stored vector by document ID."""
        record = next((item for item in self._read_index() if item["id"] == document_id), None)
        if record is None:
            raise KeyError(f"No embedding found for ID '{document_id}'.")
        return np.load(self.storage_dir / record["vector_file"], allow_pickle=False)

    def _read_index(self) -> list[dict[str, Any]]:
        if not self.index_path.exists():
            return []
        try:
            data = json.loads(self.index_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            raise RuntimeError(f"Embedding index is invalid: {self.index_path}") from error
        if not isinstance(data, list):
            raise RuntimeError(f"Embedding index must contain a JSON list: {self.index_path}")
        return data

    def _write_index(self, records: list[dict[str, Any]]) -> None:
        temporary_path = self.index_path.with_suffix(".json.tmp")
        temporary_path.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")
        temporary_path.replace(self.index_path)
