import { useMemo } from 'react';

export function useWellnessOverview({ currentStress, stressCategory, riskMeta, statsData, overallWellnessScore, entries }) {
  const overview = useMemo(() => {
    const rawMood = statsData?.avgMoodScore ? statsData.avgMoodScore / 10 : 7.2;
    const moodVal = `${rawMood.toFixed(1)}/10`;

    const sleepNum = statsData?.avgSleepHours ?? 7.1;
    const sleepVal = `${Number(sleepNum).toFixed(1)} hrs`;

    const stressVal = `${currentStress ?? 30}/100`;
    const riskVal = riskMeta?.badge || riskMeta?.title?.replace(' Level', '')?.replace(' Status', '') || 'Normal';

    // Status label & color
    let statusLabel = 'Optimal';
    let statusColor = 'var(--color-success)';
    let summary = 'Personnel wellness indicators are balanced. Standard operational readiness maintained.';

    if (currentStress >= 75 || riskMeta?.title?.includes('Critical')) {
      statusLabel = 'Critical';
      statusColor = 'var(--color-danger)';
      summary = 'Sustained severe fatigue and stress detected. Recommend immediate rest and welfare review.';
    } else if (currentStress >= 55 || riskMeta?.title?.includes('High')) {
      statusLabel = 'Elevated';
      statusColor = 'var(--color-warning)';
      summary = 'Elevated stress trends observed over consecutive duty shifts. Preemptive intervention advised.';
    } else if (currentStress >= 40 || riskMeta?.title?.includes('Elevated')) {
      statusLabel = 'Moderate';
      statusColor = 'var(--color-warning)';
      summary = 'Mild fatigue cues present. Monitor workload schedule and ensure routine rest cycles.';
    }

    const tiles = [
      {
        id: 'mood',
        label: 'Mood Index',
        value: moodVal,
        delta: '+0.3 vs baseline',
        deltaPositive: true,
        color: 'var(--color-success)',
        iconName: 'Smile'
      },
      {
        id: 'sleep',
        label: 'Sleep Average',
        value: sleepVal,
        delta: sleepNum >= 7 ? '+0.4 hrs target' : '-0.8 hrs deficit',
        deltaPositive: sleepNum >= 7,
        color: 'var(--color-accent)',
        iconName: 'Moon'
      },
      {
        id: 'stress',
        label: 'Stress & Fatigue',
        value: stressVal,
        delta: currentStress < 50 ? '-4% low fatigue' : '+12% high strain',
        deltaPositive: currentStress < 50,
        color: stressCategory?.color || 'var(--color-warning)',
        iconName: 'Zap'
      },
      {
        id: 'risk',
        label: 'Welfare Risk',
        value: riskVal,
        delta: statusLabel === 'Optimal' ? 'Nominal' : 'Review Required',
        deltaPositive: statusLabel === 'Optimal',
        color: riskMeta?.color || 'var(--color-success)',
        iconName: 'ShieldAlert'
      }
    ];

    return {
      statusLabel,
      statusColor,
      summary,
      overallScore: Math.round(overallWellnessScore || 78),
      tiles
    };
  }, [currentStress, stressCategory, riskMeta, statsData, overallWellnessScore, entries]);

  return { overview };
}
