POLICY = {
    "phone": "redact",
    "email": "redact",
    "service_id": "redact",
    "identity": "redact",
    "operational": "redact",
    "contact": "redact",
    "general": "keep",
}


def get_action(entity_type: str, context: str) -> str:
    if context in POLICY:
        return POLICY[context]

    return POLICY.get(entity_type, "keep")