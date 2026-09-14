import { GoogleGenAI } from "@google/genai";
import env from "../config/env.js";

async function transcribeAudio({ audioData, mimeType }) {
    const ai = new GoogleGenAI({ apiKey: env.googleGenAiApiKey });

    const base64Data = audioData.includes(',') ? audioData.split(',')[1] : audioData;
    const modelName = env.geminiModel || "gemini-2.5-flash";

    const response = await ai.models.generateContent({
        model: modelName,
        contents: [
            {
                parts: [
                    { text: "Transcribe the following audio recording verbatim into plain text. Output only the transcription itself — no labels, commentary, timestamps, or formatting." },
                    { inlineData: { mimeType: mimeType || "audio/webm", data: base64Data } }
                ]
            }
        ]
    });

    return (response.text || '').trim();
}

export { transcribeAudio };
