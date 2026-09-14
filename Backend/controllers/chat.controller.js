import { chatWithJournalContext } from "../services/chat.service.js";

/**
 * @desc    Chat with the AI companion using journal context
 * @route   POST /api/journal/chat
 * @access  Private
 */
async function chatWithAI(req, res) {
    try {
        const { message, conversationHistory } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message is required" });
        }

        const result = await chatWithJournalContext({
            userId: req.user.Id,
            message: message.trim(),
            conversationHistory: conversationHistory || []
        });

        res.status(200).json({
            message: "Chat response generated successfully",
            response: {
                text: result.response || "",
                followUpSuggestions: result.followUpSuggestions || []
            }
        });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({
            message: "Failed to generate chat response"
        });
    }
}

export default { chatWithAI };
