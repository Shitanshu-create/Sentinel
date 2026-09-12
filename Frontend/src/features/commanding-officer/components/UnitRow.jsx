import React from 'react';
import { ChevronRight, Shield } from 'lucide-react';
import { getRiskMeta } from '../../../shared/utils/riskMeta.js';

export function UnitRow({ unitSummary, onClick }) {
  const riskMeta = getRiskMeta(unitSummary.riskLevel);
  const sleepStr = unitSummary.avgSleep !== null && unitSummary.avgSleep !== undefined 
    ? `${unitSummary.avgSleep} hrs` 
    : 'No data';

  return (
    <button type="button" className="roster-row" onClick={onClick}>
      <div className="roster-row-main">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} style={{ color: 'var(--color-ink)' }} strokeWidth={2.5} />
          <p className="roster-row-name" style={{ margin: 0 }}>{unitSummary.unit}</p>
        </div>
        <p className="roster-row-meta" style={{ marginTop: '0.25rem' }}>
          {unitSummary.personnelCount} Personnel · Avg Sleep: {sleepStr}
        </p>
      </div>

      <div className="roster-row-metrics">
        <div className="roster-metric-chip">
          <span className="roster-metric-chip-label">Avg Stress</span>
          <span className="roster-metric-chip-val">{unitSummary.avgStress}%</span>
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

export default UnitRow;
