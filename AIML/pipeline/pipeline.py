"""The end-to-end audio, privacy, processing, and embedding workflow."""

from __future__ import annotations

from typing import Any
from uuid import uuid4

import numpy as np

from AIML.audio.preprocessing import AudioPreprocessor
from AIML.embeddings.embedding_processor import EmbeddingProcessor
from AIML.privacy.context_classifier import classify_context
from AIML.privacy.entity_detector import detect_entities
from AIML.privacy.selective_redactor import redact_text
from AIML.processing.cleaner import TranscriptCleaner
from AIML.processing.normalizer import TranscriptNormalizer
from AIML.processing.semantic_chunker import SemanticChunker
from AIML.transcription.model_loader import WhisperModelLoader
from AIML.transcription.whisper_service import WhisperService


class AudioIntelligencePipeline:
    """Turn an audio waveform into privacy-safe, searchable text chunks.

    Models load lazily when :meth:`run` is first called. The resulting vectors
    are stored locally by ``EmbeddingProcessor`` under ``storage/embeddings``.
    """

    TARGET_SAMPLE_RATE = 16_000

    def __init__(
        self,
        whisper_model: str = "base",
        language: str | None = None,
        embedding_processor: EmbeddingProcessor | None = None,
    ) -> None:
        self.audio_preprocessor = AudioPreprocessor()
        self.transcriber = WhisperService(
            WhisperModelLoader(model_name=whisper_model), language=language
        )
        self.cleaner = TranscriptCleaner()
        self.normalizer = TranscriptNormalizer()
        self.chunker = SemanticChunker()
        self.embedding_processor = embedding_processor or EmbeddingProcessor()

    def run(
        self,
        audio: np.ndarray,
        sample_rate: int,
        document_id: str | None = None,
        metadata: dict[str, Any] | None = None,
        create_embeddings: bool = True,
    ) -> dict[str, Any]:
        """Process an audio array from waveform through persisted embeddings."""
        if sample_rate <= 0:
            raise ValueError("sample_rate must be a positive integer.")

        source_duration = self._duration(audio, sample_rate)
        prepared_audio = self.audio_preprocessor.preprocess(audio)
        prepared_audio = self._resample(prepared_audio, sample_rate, self.TARGET_SAMPLE_RATE)
        transcription = self.transcriber.transcribe(prepared_audio)
        raw_text = transcription["text"]

        entities = detect_entities(raw_text)
        for entity in entities:
            entity["context"] = classify_context(raw_text, entity["start"], entity["end"])
        redacted_text = redact_text(raw_text, entities)
        cleaned_text = self.cleaner.clean(redacted_text)
        processed_text = self.normalizer.normalize(cleaned_text)
        chunks = self.chunker.chunk(processed_text)

        result: dict[str, Any] = {
            "audio": {
                "source_sample_rate": sample_rate,
                "processed_sample_rate": self.TARGET_SAMPLE_RATE,
                "duration_seconds": round(source_duration, 2),
            },
            "transcription": transcription,
            "privacy": {"entities": entities, "redacted_text": redacted_text},
            "processing": {"text": processed_text, "chunks": chunks},
            "embeddings": [],
        }

        if create_embeddings and chunks:
            batch_id = document_id or uuid4().hex
            chunk_texts = [chunk["text"] for chunk in chunks]
            chunk_ids = [f"{batch_id}-chunk-{index:03d}" for index in range(1, len(chunks) + 1)]
            chunk_metadata = [
                {
                    **(metadata or {}),
                    "source_document_id": batch_id,
                    "chunk_id": chunk["chunk_id"],
                    "start": chunk.get("start"),
                    "end": chunk.get("end"),
                }
                for chunk in chunks
            ]
            result["embeddings"] = self.embedding_processor.create_embeddings(
                chunk_texts, document_ids=chunk_ids, metadata=chunk_metadata
            )

        return result

    @staticmethod
    def _duration(audio: np.ndarray, sample_rate: int) -> float:
        if not isinstance(audio, np.ndarray) or audio.size == 0:
            raise ValueError("audio must be a non-empty NumPy array.")
        return len(audio) / sample_rate

    @staticmethod
    def _resample(audio: np.ndarray, source_rate: int, target_rate: int) -> np.ndarray:
        if source_rate == target_rate:
            return audio.astype(np.float32, copy=False)
        target_length = max(1, round(len(audio) * target_rate / source_rate))
        source_positions = np.arange(len(audio), dtype=np.float64)
        target_positions = np.linspace(0, len(audio) - 1, target_length)
        return np.interp(target_positions, source_positions, audio).astype(np.float32)
