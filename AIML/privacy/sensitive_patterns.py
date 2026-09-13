import re


SENSITIVE_PATTERNS = {
    "phone": re.compile(r"\b(?:\+91[-\s]?)?[6-9]\d{9}\b"),
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    "service_id": re.compile(r"\b[A-Z]{2,5}[-/]?\d{3,10}\b"),
}

