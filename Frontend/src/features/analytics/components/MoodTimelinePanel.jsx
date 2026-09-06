import React from 'react';
import { Panel } from './Panel.jsx';

const ranges = ['Past Week', 'Past Month', 'All Time'];
const moods = [
  { label: 'Calm', color: 'var(--color-accent)' },
  { label: 'Anxious', color: 'var(--color-danger)' },
  { label: 'Productivity', color: 'var(--color-purple)' },
  { label: 'Sadness', color: 'var(--color-success)' },
  { label: 'Happiness', color: 'var(--color-text-soft)' }
];

export function MoodTimelinePanel({ range, setRange, timeline, labels }) {
  return (
    <Panel className="timeline-panel" padding="px-5 py-5">
      <div className="timeline-header">
        <div>
          <h2 className="timeline-title">Mood Timeline</h2>
          <p className="timeline-subtitle">Emotional patterns over time</p>
        </div>
        <div className="timeline-range-buttons">
          {ranges.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={`range-btn ${range === item ? 'range-btn-active' : 'range-btn-inactive'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="timeline-legend">
        {moods.map((mood) => (
          <span key={mood.label} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: mood.color }} />
            {mood.label}
          </span>
        ))}
      </div>

      <div className="chart-container">
        <div className="chart-y-axis">
          {[100, 75, 50, 25, 0].map((value) => <span key={value}>{value}</span>)}
        </div>

        <div className="chart-bars-wrapper">
          {timeline.map((weekData, weekIndex) => (
            <div key={`${labels[weekIndex] || 'lbl'}-${weekIndex}`} className="chart-bar-group">
              <div className="chart-tooltip-wrapper">
                <div className="chart-tooltip">
                  {weekData.map((val, idx) => (
                    <div key={moods[idx].label} className="tooltip-row">
                      <span className="tooltip-key">
                        <span className="legend-dot" style={{ backgroundColor: moods[idx].color }} />
                        {moods[idx].label}
                      </span>
                      <span className="tooltip-val">{val}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bars-container">
                {weekData.map((value, moodIndex) => (
                  <div key={moods[moodIndex].label} className="single-bar-container">
                    <div
                      className="single-bar"
                      style={{
                        height: `${Math.max(value, 3)}%`,
                        backgroundColor: moods[moodIndex].color,
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="chart-x-axis-label">{labels?.[weekIndex] || ''}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
