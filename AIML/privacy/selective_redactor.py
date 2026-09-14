from .policies import get_action


def redact_text(text: str, entities: list[dict]) -> str:
    redacted_text = text

    for entity in reversed(entities):
        action = get_action(entity["type"], entity.get("context", "general"))

        if action == "redact":
            start = entity["start"]
            end = entity["end"]
            entity_type = entity["type"].upper()

            redacted_text = (
                redacted_text[:start]
                + f"[{entity_type}]"
                + redacted_text[end:]
            )

    return redacted_text