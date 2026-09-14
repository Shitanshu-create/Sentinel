"""Typed names used by callers that persist pipeline results."""

from typing import Any, TypedDict


class PipelineResult(TypedDict):
    audio: dict[str, Any]
    transcription: dict[str, Any]
    privacy: dict[str, Any]
    processing: dict[str, Any]
    embeddings: list[dict[str, Any]]
