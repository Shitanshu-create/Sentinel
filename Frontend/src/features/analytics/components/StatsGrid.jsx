import React, { useMemo } from 'react';
import { Panel } from './Panel.jsx';

export function StatsGrid({ statsData }) {
  const stats = useMemo(() => [
    { label: 'Total Entries', value: String(statsData.totalEntries), color: 'text-sky-200', dot: 'bg-sky-200' },
    { label: 'Words Written', value: statsData.totalWords >= 1000 ? `${(statsData.totalWords / 1000).toFixed(1)}k` : String(statsData.totalWords), color: 'text-purple-200', dot: 'bg-purple-200' },
    { label: 'Avg Entry Length', value: String(statsData.totalEntries > 0 ? Math.round(statsData.totalWords / statsData.totalEntries) : 0), unit: 'words', color: 'text-sprout', dot: 'bg-sprout' },
    { label: 'Longest Streak', value: String(statsData.longestStreak), unit: 'days', color: 'text-canary', dot: 'bg-canary' },
    { label: 'Mood Score Avg', value: (statsData.avgMoodScore / 10).toFixed(1), unit: '/10', color: 'text-blush', dot: 'bg-blush' }
  ], [statsData]);

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <Panel key={stat.label} padding="py-4 px-3" className="stat-card">
          <span className="stat-icon-wrapper">
            <span className={`stat-dot ${stat.dot}`} />
          </span>
          <p className={`stat-value ${stat.color}`}>{stat.value}<span className="stat-unit">{stat.unit}</span></p>
          <p className="stat-label">{stat.label}</p>
        </Panel>
      ))}
    </div>
  );
}
