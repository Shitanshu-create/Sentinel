import { useState } from 'react';
import { assignAssessment } from '../services/welfareOfficer.api.js';

export function useAssignAssessment(personnelId, onSuccess) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (questionIds) => {
    try {
      setSubmitting(true);
      setError(null);
      await assignAssessment(personnelId, { questionIds });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to assign assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}
