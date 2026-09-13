import { useState, useEffect, useCallback } from 'react';
import { fetchMyAssessments } from '../services/assessment.api.js';

export function useMyAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [assessmentsRequest, setAssessmentsRequest] = useState({ loading: false, error: null });

  const reload = useCallback(async () => {
    try {
      setAssessmentsRequest({ loading: true, error: null });
      const res = await fetchMyAssessments();
      setAssessments(res.assessments || []);
      setAssessmentsRequest({ loading: false, error: null });
    } catch (err) {
      setAssessmentsRequest({
        loading: false,
        error: err.response?.data?.message || err.message || 'Failed to load assessments'
      });
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const pendingCount = (assessments || []).filter((a) => a.status === 'assigned').length;

  return { assessments, pendingCount, assessmentsRequest, reload };
}
