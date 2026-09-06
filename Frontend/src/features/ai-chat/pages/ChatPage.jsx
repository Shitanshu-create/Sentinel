import React, { useState } from 'react';
import AppSidebar from '../../../components/AppSidebar.jsx';
import SidePanel from '../../../components/SidePanel.jsx';
import { useChat } from '../hooks/useChat.js';
import { ChatMessages } from '../components/ChatMessages.jsx';
import { ChatInputArea } from '../components/ChatInputArea.jsx';
import '../styles/ChatPage.css';

export default function ChatPage({ onOpenWriting, onOpenAnalytics, onLogout, entries, onSelectEntry }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    inputText,
    setInputText,
    messages,
    suggestions,
    loadingChat,
    chatEndRef,
    handleSendMessage,
    handleKeyDown
  } = useChat();

  return (
    <main className="chat-page-container chat-container">
      <AppSidebar
        active="chat"
        panelOpen={sidebarOpen}
        onTogglePanel={() => setSidebarOpen((value) => !value)}
        onNewEntry={onOpenWriting}
        onOpenWriting={onOpenWriting}
        onOpenChat={undefined}
        onOpenAnalytics={onOpenAnalytics}
        onLogout={onLogout}
      />
      <SidePanel 
        open={sidebarOpen} 
        entries={entries} 
        onSelectEntry={onSelectEntry} 
        onClose={() => setSidebarOpen(false)}
      />

      <section className={`chat-section ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <ChatMessages 
          messages={messages} 
          loadingChat={loadingChat} 
          chatEndRef={chatEndRef} 
        />

        <ChatInputArea 
          suggestions={suggestions}
          handleSendMessage={handleSendMessage}
          inputText={inputText}
          setInputText={setInputText}
          handleKeyDown={handleKeyDown}
          loadingChat={loadingChat}
        />
      </section>
    </main>
  );
}
