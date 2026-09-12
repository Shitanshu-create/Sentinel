import { useMemo } from 'react';
import { getRiskMeta } from '../../../shared/utils/riskMeta.js';

export function useWellnessRisk(entries, statsData) {
  const riskLevel = useMemo(() => {
    if (statsData?.wellnessRiskLevel) return statsData.wellnessRiskLevel;
    if (!entries || entries.length === 0) return 'normal';
    const latest = entries[0];
    return latest?.raw?.gemini_response?.risk_level || 'normal';
  }, [entries, statsData]);

  const riskMeta = useMemo(() => {
    return getRiskMeta(riskLevel);
  }, [riskLevel]);

  return { riskLevel, riskMeta };
}
