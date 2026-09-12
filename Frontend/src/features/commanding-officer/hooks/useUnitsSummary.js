import { useState, useEffect } from 'react';
import { fetchUnitsSummary } from '../services/commandingOfficer.api.js';

export function useUnitsSummary() {
  const [units, setUnits] = useState([]);
  const [department, setDepartment] = useState(null);
  const [unitsRequest, setUnitsRequest] = useState({ loading: false, error: null });

  useEffect(() => {
    const load = async () => {
      try {
        setUnitsRequest({ loading: true, error: null });
        const res = await fetchUnitsSummary();
        setUnits(res.units || []);
        setDepartment(res.department || null);
        setUnitsRequest({ loading: false, error: null });
      } catch (err) {
        console.error("Failed to fetch units summary:", err);
        setUnitsRequest({
          loading: false,
          error: err.response?.data?.message || err.message || 'Failed to fetch units summary'
        });
      }
    };
    load();
  }, []);

  return { units, department, unitsRequest, request: unitsRequest };
}
