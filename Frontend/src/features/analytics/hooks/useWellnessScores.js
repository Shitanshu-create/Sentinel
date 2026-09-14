import { useMemo } from 'react';

export function useWellnessScores(entries) {
  const computedWellnessScores = useMemo(() => {
    const scoredEntries = entries.filter(e => e.raw && e.raw.gemini_response && e.raw.gemini_response.calmness_score !== undefined);
    if (scoredEntries.length === 0) {
      return [
        { label: 'Calmness', value: 0, color: 'var(--color-accent)' },
        { label: 'Happiness', value: 0, color: 'var(--color-purple)' },
        { label: 'Stress Resilience', value: 0, color: 'var(--color-warning)' },
        { label: 'Positivity', value: 0, color: 'var(--color-danger)' },
        { label: 'Purpose & Direction', value: 0, color: 'var(--color-success)' }
      ];
    }
    let calm = 0, happy = 0, anxious = 0, sad = 0, prod = 0;
    scoredEntries.forEach(e => {
      const gr = e.raw.gemini_response;
      calm += gr.calmness_score || 0;
      happy += gr.happiness_score || 0;
      anxious += gr.anxious_score || 0;
      sad += gr.sadness_score || 0;
      prod += gr.productivity_score || 0;
    });
    const len = scoredEntries.length;
    const avgCalm = Math.round(calm / len);
    const avgHappy = Math.round(happy / len);
    const avgAnxious = Math.round(anxious / len);
    const avgSad = Math.round(sad / len);
    const avgProd = Math.round(prod / len);

    return [
      { label: 'Calmness', value: avgCalm, color: 'var(--color-accent)' },
      { label: 'Happiness', value: avgHappy, color: 'var(--color-purple)' },
      { label: 'Stress Resilience', value: Math.max(0, 100 - avgAnxious), color: 'var(--color-warning)' },
      { label: 'Positivity', value: Math.max(0, 100 - avgSad), color: 'var(--color-danger)' },
      { label: 'Purpose & Direction', value: avgProd, color: 'var(--color-success)' }
    ];
  }, [entries]);

  const overallWellnessScore = useMemo(() => {
    const sum = computedWellnessScores.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round(sum / computedWellnessScores.length);
  }, [computedWellnessScores]);

  return { computedWellnessScores, overallWellnessScore };
}
