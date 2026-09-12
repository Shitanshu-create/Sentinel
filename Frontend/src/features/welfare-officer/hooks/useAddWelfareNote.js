import { useState } from 'react';
import { addWelfareNote } from '../services/welfareOfficer.api.js';

export function useAddWelfareNote(personnelId, onSuccess) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async ({ note, actionType }) => {
    try {
      setSubmitting(true);
      setError(null);
      await addWelfareNote(personnelId, { note, actionType });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}
