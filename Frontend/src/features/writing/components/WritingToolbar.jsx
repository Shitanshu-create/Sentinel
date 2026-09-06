import React from 'react';
import { Bold, Highlighter, ImagePlus, Italic, Save, Sparkles, Trash2 } from 'lucide-react';

export function WritingToolbar({
  editor,
  editorReady,
  fileInputRef,
  handleMediaSelect,
  aiEnabled,
  setAiEnabled,
  saveEntry,
  saveStatus,
  deleteStatus,
  selectedEntryId,
  deleteSelectedEntry
}) {
  return (
    <div className="writing-toolbar">
      <div className="writing-format-group">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editorReady && editor.chain().focus().toggleBold().run()}
          disabled={!editorReady}
          className={`writing-format-btn ${
            editorReady && editor.isActive('bold') ? 'writing-format-btn-active' : 'writing-format-btn-inactive'
          }`}
          aria-label="Bold"
          title="Bold"
        >
          <Bold size={20} strokeWidth={3} />
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editorReady && editor.chain().focus().toggleItalic().run()}
          disabled={!editorReady}
          className={`writing-format-btn ${
            editorReady && editor.isActive('italic') ? 'writing-format-btn-active' : 'writing-format-btn-inactive'
          }`}
          aria-label="Italic"
          title="Italic"
        >
          <Italic size={20} strokeWidth={3} />
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editorReady && editor.chain().focus().toggleHighlight().run()}
          disabled={!editorReady}
          className={`writing-format-btn ${
            editorReady && editor.isActive('highlight') ? 'writing-format-btn-active' : 'writing-format-btn-inactive'
          }`}
          aria-label="Highlight"
          title="Highlight"
        >
          <Highlighter size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="writing-actions-group">
        <input
          ref={fileInputRef}
          type="file"
          className="writing-hidden"
          onChange={handleMediaSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="writing-btn-media"
        >
          <ImagePlus size={18} strokeWidth={3} />
          Add Media
        </button>
        <button
          type="button"
          onClick={() => setAiEnabled((value) => !value)}
          className={`writing-btn-ai ${
            aiEnabled ? 'writing-btn-ai-active' : 'writing-btn-ai-inactive'
          }`}
        >
          <Sparkles size={18} strokeWidth={3} />
          AI {aiEnabled ? 'On' : 'Off'}
        </button>
        <button
          type="button"
          onClick={saveEntry}
          disabled={saveStatus.loading || deleteStatus.loading}
          className="writing-btn-save"
        >
          <Save size={18} strokeWidth={3} />
          {saveStatus.loading ? 'Saving...' : 'Save'}
        </button>
        {selectedEntryId && (
          <button
            type="button"
            onClick={deleteSelectedEntry}
            disabled={saveStatus.loading || deleteStatus.loading}
            className="writing-btn-delete-icon"
            aria-label="Delete journal entry"
            title="Delete"
          >
            <Trash2 size={18} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}
