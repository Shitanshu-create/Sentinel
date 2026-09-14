import { useState, useEffect, useRef } from 'react';
import { chatWithAI } from '../services/journal.api.js';

export function useChat() {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // * Stateful chat conversation history starting with welcoming guidance
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('ai_chat_messages');
    if (saved) return JSON.parse(saved);
    return [
      {
        role: 'ai',
        text: "Hi, I'm Innerly, your AI reflection partner. I'm here to help you explore your thoughts and notice patterns in your journal."
      }
    ];
  });

  // * Dynamic follow-up recommendations populated from backend AI responses
  const [suggestions, setSuggestions] = useState(() => {
    const saved = sessionStorage.getItem('ai_chat_suggestions');
    if (saved) return JSON.parse(saved);
    return [
      "What patterns do you see in my recent entries?",
      "When do I feel most energized?",
      "What triggers my anxious days?",
      "How has my mood changed recently?"
    ];
  });

  const [loadingChat, setLoadingChat] = useState(false);

  // * Persist messages and suggestions to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('ai_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('ai_chat_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  // * Automatically scroll chat window to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingChat]);

  // * Send message handler connecting user query to backend API
  const handleSendMessage = async (textToSend) => {
    const query = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    if (!query || loadingChat) return;

    if (typeof textToSend !== 'string') {
      setInputText('');
    }

    const userMsg = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setLoadingChat(true);

    try {
      const conversationHistory = messages
        .map(m => ({
          role: m.role,
          text: m.text || ''
        }))
        .filter(m => m.text.length > 0);

      const res = await chatWithAI({ message: query, conversationHistory });
      
      if (res && res.response) {
        setMessages((prev) => [...prev, {
          role: 'ai',
          text: res.response.text
        }]);

        if (res.response.followUpSuggestions && res.response.followUpSuggestions.length > 0) {
          setSuggestions(res.response.followUpSuggestions);
        }
      }
    } catch (err) {
      console.error("Failed to generate chat response:", err);
      setMessages((prev) => [...prev, {
        role: 'ai',
        text: "I'm sorry, I'm having trouble connecting to my memory bank right now. Please try again."
      }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return {
    inputText,
    setInputText,
    messages,
    suggestions,
    loadingChat,
    chatEndRef,
    handleSendMessage,
    handleKeyDown
  };
}
