import { useMemo } from 'react';

export function useWellnessRisk(entries, statsData) {
  const riskLevel = useMemo(() => {
    if (statsData?.wellnessRiskLevel) return statsData.wellnessRiskLevel;
    if (!entries || entries.length === 0) return 'normal';
    const latest = entries[0];
    return latest?.raw?.gemini_response?.risk_level || 'normal';
  }, [entries, statsData]);

  const riskMeta = useMemo(() => {
    switch (riskLevel) {
      case 'critical':
        return {
          title: 'Critical Risk Level',
          color: 'var(--accent-rose)',
          bg: 'color-mix(in srgb, var(--accent-rose) 15%, var(--color-surface))',
          desc: 'Sustained severe fatigue and stress detected. Recommend immediate rest and welfare review.'
        };
      case 'high':
        return {
          title: 'High Risk Level',
          color: 'var(--accent-amber)',
          bg: 'color-mix(in srgb, var(--accent-amber) 15%, var(--color-surface))',
          desc: 'Elevated stress trends observed over consecutive duty shifts. Preemptive intervention advised.'
        };
      case 'elevated':
        return {
          title: 'Elevated Risk Level',
          color: 'var(--color-warning)',
          bg: 'color-mix(in srgb, var(--color-warning) 15%, var(--color-surface))',
          desc: 'Mild fatigue cues present. Monitor workload schedule and ensure routine rest cycles.'
        };
      case 'normal':
      default:
        return {
          title: 'Normal Status',
          color: 'var(--accent-green)',
          bg: 'color-mix(in srgb, var(--accent-green) 15%, var(--color-surface))',
          desc: 'Personnel indicators are balanced. Standard operational readiness maintained.'
        };
    }
  }, [riskLevel]);

  return { riskLevel, riskMeta };
}
