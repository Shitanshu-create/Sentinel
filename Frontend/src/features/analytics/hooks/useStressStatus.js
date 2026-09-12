import { useMemo } from 'react';

export function useStressStatus(entries, statsData) {
  const currentStress = useMemo(() => {
    if (!entries || entries.length === 0) {
      return statsData?.currentStressStatus ?? 0;
    }
    if (statsData?.currentStressStatus !== undefined && statsData?.currentStressStatus !== null) {
      return statsData.currentStressStatus;
    }
    const entriesWithStress = entries.filter((e) => e.raw?.gemini_response?.stress_score !== undefined);
    if (entriesWithStress.length > 0) {
      const sum = entriesWithStress.reduce((acc, curr) => acc + (curr.raw.gemini_response.stress_score || 0), 0);
      return Math.round(sum / entriesWithStress.length);
    }
    return 0;
  }, [entries, statsData]);

  const stressCategory = useMemo(() => {
    if (currentStress >= 75) return { label: 'High Stress Alert', color: 'var(--color-danger)', badge: 'Critical' };
    if (currentStress >= 55) return { label: 'Elevated Pressure', color: 'var(--color-warning)', badge: 'Elevated' };
    if (currentStress >= 35) return { label: 'Moderate Workload', color: 'var(--color-accent)', badge: 'Moderate' };
    return { label: 'Optimal Recovery', color: 'var(--color-success)', badge: 'Optimal' };
  }, [currentStress]);

  return { currentStress, stressCategory };
}
