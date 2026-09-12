import { useState, useEffect, useCallback } from 'react';
import { fetchUnitDetail } from '../services/commandingOfficer.api.js';

function formatUnitEntry(backendEntry) {
  return {
    id: backendEntry._id,
    date: backendEntry.date,
    raw: backendEntry
  };
}

export function useUnitDetail(unitName) {
  const [unit, setUnit] = useState(null);
  const [force, setForce] = useState(null);
  const [personnelCount, setPersonnelCount] = useState(0);
  const [worstCaseRiskLevel, setWorstCaseRiskLevel] = useState('normal');
  const [unitStats, setUnitStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [notes, setNotes] = useState([]);
  const [detailRequest, setDetailRequest] = useState({ loading: false, error: null });

  const reload = useCallback(async () => {
    if (!unitName) return;
    try {
      setDetailRequest({ loading: true, error: null });
      const res = await fetchUnitDetail(unitName);
      setUnit(res.unit);
      setForce(res.force || res.department || null);
      setPersonnelCount(res.personnelCount || 0);
      setWorstCaseRiskLevel(res.stats?.wellnessRiskLevel || 'normal');
      setUnitStats(res.stats || null);
      setEntries((res.entries || []).map(formatUnitEntry));
      setNotes(res.notes || []);
      setDetailRequest({ loading: false, error: null });
    } catch (err) {
      console.error("Failed to fetch unit detail:", err);
      setDetailRequest({
        loading: false,
        error: err.response?.data?.message || err.message || 'Failed to fetch unit detail'
      });
    }
  }, [unitName]);

  useEffect(() => { reload(); }, [reload]);

  return {
    unit,
    force,
    department: force,
    personnelCount,
    worstCaseRiskLevel,
    unitStats,
    statsData: unitStats,
    entries,
    notes,
    request: detailRequest,
    detailRequest,
    reload
  };
}
