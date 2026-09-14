import { useState, useEffect, useCallback } from 'react';
import { fetchOfficerAssessments } from '../services/welfareOfficer.api.js';

export function useOfficerAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [assessmentsRequest, setAssessmentsRequest] = useState({ loading: false, error: null });

  const reload = useCallback(async () => {
    try {
      setAssessmentsRequest({ loading: true, error: null });
      const res = await fetchOfficerAssessments();
      setAssessments(res.assessments || []);
      setAssessmentsRequest({ loading: false, error: null });
    } catch (err) {
      setAssessmentsRequest({
        loading: false,
        error: err.response?.data?.message || err.message || 'Failed to fetch assessments'
      });
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { assessments, assessmentsRequest, reload };
}
