import { useState, useEffect, useCallback } from 'react';
import { fetchPersonnelDetail } from '../services/welfareOfficer.api.js';

function formatPersonnelEntry(backendEntry) {
  return { id: backendEntry._id, raw: backendEntry };
}

export function usePersonnelDetail(id) {
  const [person, setPerson] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState({ observations: [], welfareRecommendations: [] });
  const [notes, setNotes] = useState([]);
  const [detailRequest, setDetailRequest] = useState({ loading: false, error: null });

  const reload = useCallback(async () => {
    if (!id) return;
    try {
      setDetailRequest({ loading: true, error: null });
      const res = await fetchPersonnelDetail(id);
      setPerson(res.person);
      setStatsData(res.stats);
      setEntries((res.recentEntries || []).map(formatPersonnelEntry));
      setInsights(res.insights || { observations: [], welfareRecommendations: [] });
      setNotes(res.notes || []);
      setDetailRequest({ loading: false, error: null });
    } catch (err) {
      console.error("Failed to fetch personnel detail:", err);
      setDetailRequest({
        loading: false,
        error: err.response?.data?.message || err.message || 'Failed to fetch personnel detail'
      });
    }
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  return { person, statsData, entries, insights, notes, detailRequest, reload };
}
