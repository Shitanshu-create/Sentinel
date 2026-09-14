import React from 'react';
import { Panel } from './Panel.jsx';

export function CurrentStreakPanel({ currentStreak, heatmapDays }) {
  return (
    <Panel className="streak-panel" padding="px-5 py-6">
      <div className="streak-bg-glow" />
      <p className="streak-label">Current Streak</p>
      <p className="streak-value">{currentStreak}</p>
      <p className="streak-subtitle">Consecutive Days</p>

      <div className="streak-divider">
        <span className="line-indicator" />
        <span className="dot-indicator" />
        <span className="dot-indicator" />
      </div>

      <div className="streak-heatmap">
        {heatmapDays.map((day, index) => (
          <span
            key={`${day}-${index}`}
            className={
              day === 'today'
                ? 'day-today'
                : day === 'filled'
                  ? 'day-filled'
                  : 'day-empty'
            }
          />
        ))}
      </div>
    </Panel>
  );
}
