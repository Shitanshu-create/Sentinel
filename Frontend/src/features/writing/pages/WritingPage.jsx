import React, { useEffect, useMemo, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import AppSidebar from '../../../components/AppSidebar.jsx';
import SidePanel from '../../../components/SidePanel.jsx';
import { useJournalEditor } from '../hooks/useJournalEditor.js';
import { useEntryActions } from '../hooks/useEntryActions.js';
import { useMedia } from '../hooks/useMedia.js';
import { WritingToolbar } from '../components/WritingToolbar.jsx';
import { MediaDisplay } from '../components/MediaDisplay.jsx';
import '../styles/writing.css';

// * Helper to convert binary buffer data to base64 data URL
const getMediaUrl = (mediaItem) => {
  if (!mediaItem || !mediaItem.data) return null;
  const bufferData = mediaItem.data.data || mediaItem.data;
  let binary = '';
  const bytes = new Uint8Array(bufferData);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = window.btoa(binary);
  return `data:${mediaItem.contentType};base64,${base64}`;
};

const decodeEditorContent = (content = '') => {
  if (!content) return '';
  if (!content.includes('&lt;') && !content.includes('&gt;')) return content;

  const element = document.createElement('textarea');
  element.innerHTML = content;
  return element.value;
};

function WritingPage({
  onLogout,
  onOpenAnalytics,
  onOpenChat,
  entries,
  setEntries,
  selectedEntryId,
  setSelectedEntryId
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState(() => {
    if (!selectedEntryId) return sessionStorage.getItem('unsaved_journal_title') || '';
    return '';
  });
  const [aiEnabled, setAiEnabled] = useState(true);

  const { editor, editorReady, journalText, setJournalText } = useJournalEditor({ selectedEntryId });
  const { media, setMedia, fileInputRef, handleMediaSelect, removeMedia } = useMedia();

  const {
    saveStatus,
    deleteStatus,
    saveEntry,
    deleteSelectedEntry,
    startNewEntry,
    selectEntry,
    clearActionStatus
  } = useEntryActions({
    selectedEntryId,
    setSelectedEntryId,
    entries,
    setEntries,
    title,
    setTitle,
    journalText,
    editorReady,
    editor,
    aiEnabled,
    media
  });

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());
  }, []);

  // * Keep editor fields synchronized with active selected entry ID
  useEffect(() => {
    if (!editor || !editorReady) return;

    if (selectedEntryId) {
      const entry = entries.find((e) => e.id === selectedEntryId);
      if (entry) {
        setTitle(entry.title);
        const nextContent = decodeEditorContent(entry.content || entry.raw?.chat || entry.preview || '');
        setJournalText(nextContent);
        editor?.commands?.setContent(nextContent);
        const isAiDisabled = entry.raw?.isPrivate === true || entry.raw?.reflection?.[0] === "Private Entry - AI Analysis disabled";
        setAiEnabled(!isAiDisabled);

        if (entry.raw?.media && entry.raw.media.length > 0) {
          const m = entry.raw.media[0];
          const url = getMediaUrl(m);
          setMedia({
            name: m.filename,
            type: m.contentType,
            url: url
          });
        } else {
          setMedia(null);
        }
      }
    } else {
      const savedTitle = sessionStorage.getItem('unsaved_journal_title') || '';
      const savedContent = sessionStorage.getItem('unsaved_journal_content') || '';
      setTitle(savedTitle);
      setJournalText(savedContent);
      editor?.commands?.setContent(savedContent);
      setMedia(null);
    }
  }, [selectedEntryId, entries, editorReady, editor]);

  // * Cache draft data for unsaved entries
  useEffect(() => {
    if (!selectedEntryId) {
      sessionStorage.setItem('unsaved_journal_title', title);
      sessionStorage.setItem('unsaved_journal_content', journalText);
    }
  }, [title, journalText, selectedEntryId]);

  return (
    <main className="writing-page-container writing-scroll">
      <div className="writing-flex-wrapper">
        <AppSidebar
          active="journal"
          panelOpen={sidebarOpen}
          onTogglePanel={() => setSidebarOpen((value) => !value)}
          onNewEntry={startNewEntry}
          onOpenWriting={() => {
            if (selectedEntryId) {
              setSelectedEntryId(null);
            }
          }}
          onOpenChat={onOpenChat}
          onOpenAnalytics={onOpenAnalytics}
          onLogout={onLogout}
        />

        <SidePanel
          open={sidebarOpen}
          entries={entries}
          onSelectEntry={selectEntry}
          onClose={() => setSidebarOpen(false)}
        />

        <section className={`writing-section ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className={`writing-content ${sidebarOpen ? 'content-sidebar-open' : 'content-sidebar-closed'}`}>
            <div>
              {selectedEntryId && (
                <div className="writing-top-actions">
                </div>
              )}

              <label className="writing-label">
                Title
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give this entry a name..."
                className="writing-title-input"
              />

              <label className="writing-label">
                Writing
              </label>
              <EditorContent editor={editor} className="writing-editor" />

              <MediaDisplay media={media} removeMedia={removeMedia} />

              {saveStatus.error && (
                <p className="writing-label" style={{ color: 'var(--color-danger-text)' }}>
                  {saveStatus.error}
                </p>
              )}

              {saveStatus.success && saveStatus.message && (
                <p className="writing-label" style={{ color: 'var(--color-success)' }}>
                  {saveStatus.message || 'Saved'}
                </p>
              )}

              <WritingToolbar
                editor={editor}
                editorReady={editorReady}
                fileInputRef={fileInputRef}
                handleMediaSelect={handleMediaSelect}
                aiEnabled={aiEnabled}
                setAiEnabled={setAiEnabled}
                saveEntry={saveEntry}
                saveStatus={saveStatus}
                deleteStatus={deleteStatus}
                selectedEntryId={selectedEntryId}
                deleteSelectedEntry={deleteSelectedEntry}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default WritingPage;
