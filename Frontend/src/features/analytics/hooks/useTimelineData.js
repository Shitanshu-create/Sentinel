import { useMemo } from 'react';

export function useTimelineData(entries, range) {
  const timelineLabels = useMemo(() => {
    const pastWeekLabels = Array.from({ length: 4 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (3 - i));
      return d.toLocaleDateString('en-IN', { weekday: 'short' });
    });

    const pastMonthLabels = Array.from({ length: 4 }, (_, i) => {
      const d = new Date();
      d.setDate(1); 
      d.setMonth(d.getMonth() - (3 - i));
      return d.toLocaleDateString('en-IN', { month: 'short' });
    });

    const allTimeLabels = ['All Time'];

    return {
      'Past Week': pastWeekLabels,
      'Past Month': pastMonthLabels,
      'All Time': allTimeLabels
    };
  }, []);

  const timeline = useMemo(() => {
    if (!entries || entries.length === 0) {
      return [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    }

    const scoredEntries = entries
      .filter(e => e.raw && e.raw.gemini_response && e.raw.gemini_response.calmness_score !== undefined)
      .sort((a, b) => new Date(a.raw.date) - new Date(b.raw.date));

    if (scoredEntries.length === 0) {
      return [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    }

    if (range === 'Past Week') {
      const last4Days = Array.from({ length: 4 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (3 - i));
        return d;
      });
      return last4Days.map(dayDate => {
        const dayStr = dayDate.toDateString();
        const matches = scoredEntries.filter(e => new Date(e.raw.date).toDateString() === dayStr);
        if (matches.length === 0) return [0, 0, 0, 0, 0];
        const avg = [0, 0, 0, 0, 0];
        matches.forEach(m => {
          const gr = m.raw.gemini_response;
          avg[0] += gr.calmness_score || 0;
          avg[1] += gr.anxious_score || 0;
          avg[2] += gr.productivity_score || 0;
          avg[3] += gr.sadness_score || 0;
          avg[4] += gr.happiness_score || 0;
        });
        return avg.map(v => Math.round(v / matches.length));
      });
    } else if (range === 'Past Month') {
      return Array.from({ length: 4 }, (_, monthIdx) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - (3 - monthIdx));
        const targetMonth = d.getMonth();
        const targetYear = d.getFullYear();

        const matches = scoredEntries.filter(e => {
          const entryDate = new Date(e.raw.date);
          return entryDate.getMonth() === targetMonth && entryDate.getFullYear() === targetYear;
        });

        if (matches.length === 0) return [0, 0, 0, 0, 0];
        const avg = [0, 0, 0, 0, 0];
        matches.forEach(m => {
          const gr = m.raw.gemini_response;
          avg[0] += gr.calmness_score || 0;
          avg[1] += gr.anxious_score || 0;
          avg[2] += gr.productivity_score || 0;
          avg[3] += gr.sadness_score || 0;
          avg[4] += gr.happiness_score || 0;
        });
        return avg.map(v => Math.round(v / matches.length));
      });
    } else {
      if (scoredEntries.length === 0) return [[0, 0, 0, 0, 0]];
      const avg = [0, 0, 0, 0, 0];
      scoredEntries.forEach(m => {
        const gr = m.raw.gemini_response;
        avg[0] += gr.calmness_score || 0;
        avg[1] += gr.anxious_score || 0;
        avg[2] += gr.productivity_score || 0;
        avg[3] += gr.sadness_score || 0;
        avg[4] += gr.happiness_score || 0;
      });
      return [avg.map(v => Math.round(v / scoredEntries.length))];
    }
  }, [entries, range]);

  return { timeline, timelineLabels };
}
