import { useState } from 'react';
import { submitAssessment } from '../services/assessment.api.js';

export function useSubmitAssessment(assessmentId, onSuccess) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (answers) => {
    try {
      setSubmitting(true);
      setError(null);
      await submitAssessment(assessmentId, { answers });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}
