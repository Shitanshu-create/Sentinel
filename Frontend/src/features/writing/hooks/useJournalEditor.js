import { useState } from 'react';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';

export function useJournalEditor({ selectedEntryId }) {
  const [journalText, setJournalText] = useState(() => {
    if (!selectedEntryId) return sessionStorage.getItem('unsaved_journal_content') || '';
    return '';
  });
  const [, setEditorStateVersion] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: false })
    ],
    immediatelyRender: false,
    content: !selectedEntryId ? (sessionStorage.getItem('unsaved_journal_content') || '') : '',
    editorProps: {
      attributes: {
        'aria-label': 'Write journal entry',
        'aria-multiline': 'true',
        'data-placeholder': 'Write what is true right now...'
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      setJournalText(currentEditor.getHTML());
      setEditorStateVersion((version) => version + 1);
    },
    onSelectionUpdate: () => {
      setEditorStateVersion((version) => version + 1);
    },
    onTransaction: () => {
      setEditorStateVersion((version) => version + 1);
    }
  });

  const editorReady = Boolean(editor && !editor.isDestroyed && editor.commands);

  return { editor, editorReady, journalText, setJournalText };
}
