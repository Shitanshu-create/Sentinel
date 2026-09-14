import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Panel } from './Panel.jsx';

const rangeOptions = ['7D', '30D', '90D'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-key" style={{ marginBottom: '0.25rem', fontWeight: 700 }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="tooltip-row">
          <span className="tooltip-key">
            <span className="legend-dot" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <span className="tooltip-val">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function WellnessTrendsPanel({ range, setRange, trendData, labels }) {
  const chartData = (labels || []).map((label, i) => ({
    label,
    Mood: trendData?.mood?.[i] ?? 0,
    Sleep: trendData?.sleep?.[i] ?? 0,
    'Stress/Fatigue': trendData?.stress?.[i] ?? 0
  }));

  return (
    <Panel className="wellness-trends-panel" padding="px-5 py-5">
      <div className="timeline-header">
        <div>
          <h2 className="timeline-title">Wellness Trends</h2>
          <p className="timeline-subtitle">Mood, sleep, and stress patterns over time (0–10 scale)</p>
        </div>
        <div className="timeline-range-buttons">
          {rangeOptions.map((item) => (
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

      <div className="wellness-trends-chart-wrapper">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--color-text-faint)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} stroke="var(--color-text-faint)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="left"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}
            />
            <Line type="monotone" dataKey="Mood" stroke="var(--color-success)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Sleep" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Stress/Fatigue" stroke="var(--color-warning)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
