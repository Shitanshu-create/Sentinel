export function sanitizeForPrompt(text) {
    if (!text) return text;
    return text
        .replace(/---/g, '—')       // break markdown-style separators
        .slice(0, 20000);            // enforce length cap matching validation
}
