import { useState, useEffect } from 'react';
import { fetchRoster } from '../services/welfareOfficer.api.js';

export function useRoster() {
  const [roster, setRoster] = useState([]);
  const [rosterRequest, setRosterRequest] = useState({ loading: false, error: null });

  useEffect(() => {
    const load = async () => {
      try {
        setRosterRequest({ loading: true, error: null });
        const res = await fetchRoster();
        setRoster(res.roster || []);
        setRosterRequest({ loading: false, error: null });
      } catch (err) {
        console.error("Failed to fetch roster:", err);
        setRosterRequest({
          loading: false,
          error: err.response?.data?.message || err.message || 'Failed to fetch roster'
        });
      }
    };
    load();
  }, []);

  return { roster, rosterRequest };
}
