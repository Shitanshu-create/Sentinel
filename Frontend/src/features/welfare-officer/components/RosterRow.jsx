import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getRiskMeta } from '../../../shared/utils/riskMeta.js';

export function RosterRow({ person, onClick }) {
  const riskLevel = person.stats?.wellnessRiskLevel || 'normal';
  const riskMeta = getRiskMeta(riskLevel);
  const stress = person.stats?.currentStressStatus ?? 0;

  return (
    <button type="button" className="roster-row" onClick={onClick}>
      <div className="roster-row-main">
        <p className="roster-row-name">{person.name}</p>
        <p className="roster-row-meta">
          {person.rank || 'Personnel'} · {person.postingLocation || 'Deployment Active'} · {person.unit || 'Unit'}
        </p>
      </div>

      <div className="roster-row-metrics">
        <div className="roster-metric-chip">
          <span className="roster-metric-chip-label">Stress</span>
          <span className="roster-metric-chip-val">{stress}%</span>
        </div>
        <span
          className="roster-risk-badge"
          style={{
            color: riskMeta.color,
            borderColor: riskMeta.color,
            backgroundColor: `color-mix(in srgb, ${riskMeta.color} 12%, transparent)`
          }}
        >
          {riskMeta.title}
        </span>
        <ChevronRight size={18} className="roster-row-arrow" />
      </div>
    </button>
  );
}
