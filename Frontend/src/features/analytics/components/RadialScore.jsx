import React from 'react';

export function RadialScore({ value, color, label, large = false }) {
  return (
    <div className={`radial-score-wrapper ${large ? 'radial-score-wrapper-lg' : ''}`}>
      <div
        className={`radial-outer-circle ${large ? 'radial-outer-circle-lg' : ''}`}
        style={{ background: `conic-gradient(${color} ${value * 3.6}deg, var(--color-surface-hover) 0deg)` }}
      >
        <div className={`radial-inner-circle ${large ? 'radial-inner-circle-lg' : ''}`} style={{ color }}>
          {value}
        </div>
      </div>
      <p className={`radial-label ${large ? 'radial-label-lg' : ''}`}>{label}</p>
    </div>
  );
}
