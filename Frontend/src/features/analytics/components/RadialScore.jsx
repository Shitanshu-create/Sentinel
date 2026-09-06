import React from 'react';

export function RadialScore({ value, color, label }) {
  return (
    <div className="radial-score-wrapper">
      <div
        className="radial-outer-circle"
        style={{ background: `conic-gradient(${color} ${value * 3.6}deg, var(--color-surface-hover) 0deg)` }}
      >
        <div className="radial-inner-circle" style={{ color }}>
          {value}
        </div>
      </div>
      <p className="radial-label">{label}</p>
    </div>
  );
}
