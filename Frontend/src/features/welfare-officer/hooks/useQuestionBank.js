import { useState, useEffect } from 'react';
import { fetchQuestionBank } from '../services/welfareOfficer.api.js';

export function useQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [bankRequest, setBankRequest] = useState({ loading: false, error: null });

  useEffect(() => {
    const load = async () => {
      try {
        setBankRequest({ loading: true, error: null });
        const res = await fetchQuestionBank();
        setQuestions(res.questions || []);
        setBankRequest({ loading: false, error: null });
      } catch (err) {
        setBankRequest({ loading: false, error: err.response?.data?.message || err.message || 'Failed to load questions' });
      }
    };
    load();
  }, []);

  return { questions, bankRequest };
}
