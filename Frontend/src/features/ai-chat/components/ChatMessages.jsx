import React from 'react';

export function ChatMessages({ messages, loadingChat, chatEndRef }) {
  return (
    <div className="chat-body-scroll">
      {messages.map((msg, index) => (
        <div
          key={index}
          className="chat-message-wrapper"
          style={msg.role === 'user' ? { marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '80%', marginBottom: '1.5rem' } : { marginBottom: '1.5rem' }}
        >
          <div className="chat-sender-label">
            <span className="chat-indicator-dot" />
            {msg.role === 'user' ? 'YOU' : 'INNERLY'}
          </div>
          <div
            className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : ''}`}
          >
            {msg.text && (
              <>
                {/* AI text is rendered as plain text — React auto-escapes. 
                    DO NOT use dangerouslySetInnerHTML here. */}
                <p>{msg.text}</p>
              </>
            )}
          </div>
        </div>
      ))}

      {loadingChat && (
        <div className="chat-message-wrapper" style={{ marginBottom: '1.5rem' }}>
          <div className="chat-sender-label">
            <span className="chat-indicator-dot" />
            INNERLY
          </div>
          <div className="chat-bubble">
            <p className="animate-pulse">Innerly is listening and thinking...</p>
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}
