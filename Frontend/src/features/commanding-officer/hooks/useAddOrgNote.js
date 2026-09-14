import { useState } from 'react';
import { addOrganizationalNote } from '../services/commandingOfficer.api.js';

export function useAddOrgNote(unitName, onSuccess) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async ({ note, actionType }) => {
    try {
      setSubmitting(true);
      setError(null);
      await addOrganizationalNote(unitName, { note, actionType });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}
