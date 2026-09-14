import { useMemo } from 'react';

export function useHeatmapDays(entries) {
  const heatmapDays = useMemo(() => {
    const days = Array.from({ length: 35 }, (_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (34 - index));
      return d;
    });

    return days.map((dayDate, index) => {
      const dayStr = dayDate.toDateString();
      const hasEntry = entries.some(e => new Date(e.raw?.date).toDateString() === dayStr);
      if (index === 34) return hasEntry ? 'filled' : 'today';
      return hasEntry ? 'filled' : 'empty';
    });
  }, [entries]);

  // Compute current streak client-side from entries so it stays in sync with heatmap boxes
  const computedCurrentStreak = useMemo(() => {
    if (!entries || entries.length === 0) return 0;

    const entryDates = new Set(
      entries
        .filter(e => e.raw?.date)
        .map(e => new Date(e.raw.date).toDateString())
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today has an entry; if not, start counting from yesterday
    const todayStr = today.toDateString();
    const startFromToday = entryDates.has(todayStr);

    for (let i = startFromToday ? 0 : 1; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (entryDates.has(d.toDateString())) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [entries]);

  return { heatmapDays, computedCurrentStreak };
}
