import React from 'react';
import { ChevronRight, Shield } from 'lucide-react';
import { getRiskMeta } from '../../../shared/utils/riskMeta.js';

export function UnitRow({ unitSummary, unitData, unit: rawUnit, onClick }) {
  const data = unitSummary || unitData || rawUnit || {};
  const riskMeta = getRiskMeta(data.worstCaseRiskLevel || data.riskLevel || 'normal');
  const sleepStr = data.avgSleep !== null && data.avgSleep !== undefined 
    ? `${data.avgSleep} hrs` 
    : 'No data';
  const unitName = data.unit || 'Unassigned Unit';
  const personnelCount = data.personnelCount ?? 0;
  const avgStress = data.avgStress ?? 0;

  return (
    <button type="button" className="roster-row" onClick={onClick}>
      <div className="roster-row-main">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} style={{ color: 'var(--color-ink)' }} strokeWidth={2.5} />
          <p className="roster-row-name" style={{ margin: 0 }}>{unitName}</p>
        </div>
        <p className="roster-row-meta" style={{ marginTop: '0.25rem' }}>
          {personnelCount} Personnel · Avg Sleep: {sleepStr}
        </p>
      </div>

      <div className="roster-row-metrics">
        <div className="roster-metric-chip">
          <span className="roster-metric-chip-label">Avg Stress</span>
          <span className="roster-metric-chip-val">{avgStress}%</span>
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
