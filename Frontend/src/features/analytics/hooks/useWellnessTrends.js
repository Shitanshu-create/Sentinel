import { useMemo } from 'react';

/**
 * Normalizes entry data into 0-10 scale metrics for Mood, Sleep, and Stress/Fatigue.
 */
function extractEntryMetrics(entry) {
  const gr = entry.raw?.gemini_response || {};
  // Mood composite: 0-100 normalized to 0-10
  // calmness (pos) + happiness (pos) + (100 - anxiety) + (100 - sadness)
  let moodScore = 70;
  if (gr.calmness_score !== undefined || gr.happiness_score !== undefined) {
    const calmness = gr.calmness_score ?? 60;
    const happiness = gr.happiness_score ?? 60;
    const anxiety = gr.anxious_score ?? 30;
    const sadness = gr.sadness_score ?? 20;
    moodScore = (calmness + happiness + (100 - anxiety) + (100 - sadness)) / 4;
  }
  const mood = Math.round((moodScore / 10) * 10) / 10;

  // Sleep: direct hours, clamped 0-10
  const rawSleep = entry.raw?.sleepHours;
  const sleep = (rawSleep !== null && rawSleep !== undefined && !isNaN(rawSleep))
    ? Math.min(10, Math.max(0, Math.round(Number(rawSleep) * 10) / 10))
    : null;

  // Stress: 0-100 normalized to 0-10
  const rawStress = gr.stress_score ?? gr.anxious_score ?? 30;
  const stress = Math.min(10, Math.max(0, Math.round((Number(rawStress) / 10) * 10) / 10));

  return { mood, sleep, stress };
}

export function useWellnessTrends(entries, range = '30D') {
  return useMemo(() => {
    const numPoints = range === '7D' ? 7 : range === '30D' ? 6 : 12;
    const daysPerBucket = range === '7D' ? 1 : range === '30D' ? 5 : 7;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const labels = [];
    const buckets = [];

    for (let i = numPoints - 1; i >= 0; i--) {
      const bucketEnd = new Date(today);
      bucketEnd.setDate(today.getDate() - (i * daysPerBucket));
      const bucketStart = new Date(bucketEnd);
      bucketStart.setDate(bucketEnd.getDate() - (daysPerBucket - 1));
      bucketStart.setHours(0, 0, 0, 0);

      const label = range === '7D'
        ? bucketEnd.toLocaleDateString('en-IN', { weekday: 'short' })
        : bucketEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      labels.push(label);
      buckets.push({ start: bucketStart, end: bucketEnd });
    }

    const validEntries = (entries || []).filter(e => e.raw?.date);

    // Default fallbacks if no entries exist
    let lastMood = 7.0;
    let lastSleep = 7.0;
    let lastStress = 3.2;

    const moodList = [];
    const sleepList = [];
    const stressList = [];

    buckets.forEach(({ start, end }) => {
      const matching = validEntries.filter(e => {
        const d = new Date(e.raw.date);
        return d >= start && d <= end;
      });

      if (matching.length > 0) {
        let sumMood = 0;
        let sumSleep = 0;
        let countSleep = 0;
        let sumStress = 0;

        matching.forEach(entry => {
          const { mood, sleep, stress } = extractEntryMetrics(entry);
          sumMood += mood;
          if (sleep !== null) {
            sumSleep += sleep;
            countSleep++;
          }
          sumStress += stress;
        });

        const bucketMood = Math.round((sumMood / matching.length) * 10) / 10;
        const bucketSleep = countSleep > 0
          ? Math.round((sumSleep / countSleep) * 10) / 10
          : lastSleep;
        const bucketStress = Math.round((sumStress / matching.length) * 10) / 10;

        lastMood = bucketMood;
        lastSleep = bucketSleep;
        lastStress = bucketStress;

        moodList.push(bucketMood);
        sleepList.push(bucketSleep);
        stressList.push(bucketStress);
      } else {
        // Carry forward slightly varied baseline so chart is smooth and informative
        moodList.push(lastMood);
        sleepList.push(lastSleep);
        stressList.push(lastStress);
      }
    });

    return {
      trendData: {
        mood: moodList,
        sleep: sleepList,
        stress: stressList
      },
      labels
    };
  }, [entries, range]);
}
