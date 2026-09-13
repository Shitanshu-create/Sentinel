from .sensitive_patterns import SENSITIVE_PATTERNS


def detect_entities(text: str) -> list[dict]:
    entities = []

    for entity_type, pattern in SENSITIVE_PATTERNS.items():
        for match in pattern.finditer(text):
            entities.append({
                "type": entity_type,
                "text": match.group(),
                "start": match.start(),
                "end": match.end()
            })

    return entities