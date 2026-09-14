def classify_context(text: str, start: int, end: int) -> str:
    context = text[max(0, start - 50):min(len(text), end + 50)].lower()

    if any(word in context for word in ["posted", "deployed", "stationed", "unit"]):
        return "operational"

    if any(word in context for word in ["my name", "i am", "my id", "service number"]):
        return "identity"

    if any(word in context for word in ["contact", "call me", "reach me"]):
        return "contact"

    return "general"