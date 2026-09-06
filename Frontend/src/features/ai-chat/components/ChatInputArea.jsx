import React from 'react';
import { Send } from 'lucide-react';

export function ChatInputArea({ suggestions, handleSendMessage, inputText, setInputText, handleKeyDown, loadingChat }) {
  return (
    <div className="chat-footer-wrapper">
      <div className="chat-suggestions-group">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            className="chat-suggestion-btn"
            onClick={() => handleSendMessage(suggestion)}
            disabled={loadingChat}
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      <div className="chat-input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share a thought..."
          className="chat-input-textarea"
          rows="1"
          disabled={loadingChat}
        />
        <button 
          className="chat-send-btn"
          onClick={() => handleSendMessage()}
          disabled={loadingChat}
        >
          <Send size={15} />
        </button>
      </div>
      <div className="chat-hint-text">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
