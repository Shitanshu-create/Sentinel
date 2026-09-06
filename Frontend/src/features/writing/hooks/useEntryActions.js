import { useState, useEffect, useRef } from 'react';
import { createEntry, deleteEntry, updateEntry } from '../../ai-chat/services/journal.api.js';
import { formatEntry } from '../../../shared/utils/formatEntry.js';

// Helper to convert browser File object to base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export function useEntryActions({
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
}) {
  const [saveStatus, setSaveStatus] = useState({
    loading: false,
    error: null,
    success: false,
    message: null
  });
  const [deleteStatus, setDeleteStatus] = useState({ loading: false });

  const clearActionStatus = () => {
    setSaveStatus({ loading: false, error: null, success: false, message: null });
    setDeleteStatus({ loading: false });
  };

  const saveEntry = async () => {
    if (saveStatus.loading || deleteStatus.loading) return;

    const cleanTitle = title.trim() || 'Untitled entry';
    const cleanText = !editorReady || editor.isEmpty ? 'No text yet.' : journalText.trim();

    try {
      setSaveStatus({ loading: true, error: null, success: false, message: null });
      let uploadedFiles = [];
      if (media && media.file) {
        const base64Data = await fileToBase64(media.file);
        uploadedFiles.push({
          name: media.name,
          type: media.type,
          data: base64Data
        });
      }

      let res;
      if (selectedEntryId) {
        res = await updateEntry(selectedEntryId, {
          title: cleanTitle,
          chat: cleanText,
          aiActive: aiEnabled
        });
        const formatted = formatEntry(res.entry);
        setEntries((current) =>
          current.map((item) => (item.id === selectedEntryId ? formatted : item))
        );
        setSaveStatus({ loading: false, error: null, success: false, message: null });
      } else {
        res = await createEntry({
          title: cleanTitle,
          chat: cleanText,
          aiActive: aiEnabled,
          uploadedFiles
        });
        const formatted = formatEntry(res.journalReport);
        setEntries((current) => [formatted, ...current]);
        setSelectedEntryId(formatted.id);
        setSaveStatus({ loading: false, error: null, success: true, message: 'Saved' });
        sessionStorage.removeItem('unsaved_journal_title');
        sessionStorage.removeItem('unsaved_journal_content');
      }
    } catch (err) {
      console.error("Failed to save entry:", err);
      setSaveStatus({
        loading: false,
        error: err.response?.data?.message || err.message || 'Failed to save entry',
        success: false,
        message: null
      });
    }
  };

  const deleteSelectedEntry = async () => {
    if (!selectedEntryId || saveStatus.loading || deleteStatus.loading) return;

    const confirmed = window.confirm('Delete this journal entry? This cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleteStatus({ loading: true });
      setSaveStatus({ loading: false, error: null, success: false, message: null });
      await deleteEntry(selectedEntryId);
      setEntries((current) => current.filter((item) => item.id !== selectedEntryId));
      setSelectedEntryId(null);
      setSaveStatus({ loading: false, error: null, success: false, message: null });
    } catch (err) {
      console.error("Failed to delete entry:", err);
      setSaveStatus({
        loading: false,
        error: err.response?.data?.message || err.message || 'Failed to delete entry',
        success: false,
        message: null
      });
    } finally {
      setDeleteStatus({ loading: false });
    }
  };

  const startNewEntry = () => {
    clearActionStatus();
    sessionStorage.removeItem('unsaved_journal_title');
    sessionStorage.removeItem('unsaved_journal_content');
    setTitle('');
    editor?.commands?.setContent('');
    setSelectedEntryId(null);
  };

  const selectEntry = (entry) => {
    clearActionStatus();
    setSelectedEntryId(entry.id);
  };

  return {
    saveStatus,
    deleteStatus,
    saveEntry,
    deleteSelectedEntry,
    startNewEntry,
    selectEntry,
    clearActionStatus
  };
}
