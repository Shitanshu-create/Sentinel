import React, { useMemo } from 'react';
import { Panel } from '../../analytics/components/Panel.jsx';

export function UnitSummaryPanel({ roster }) {
  const summary = useMemo(() => {
    const total = roster.length;
    const byRisk = { normal: 0, elevated: 0, high: 0, critical: 0 };
    roster.forEach((p) => {
      const level = p.stats?.wellnessRiskLevel || 'normal';
      byRisk[level] = (byRisk[level] || 0) + 1;
    });
    return { total, byRisk };
  }, [roster]);

  return (
    <Panel className="unit-summary-panel" padding="p-5">
      <div className="unit-summary-header">
        <h2 className="obs-title">Unit Welfare Summary</h2>
        <p className="unit-summary-sub">Aggregate risk distribution for your active command unit</p>
      </div>
      <div className="unit-summary-grid">
        <div className="unit-summary-stat">
          <p className="unit-stat-value">{summary.total}</p>
          <p className="unit-stat-label">Total Personnel</p>
        </div>
        <div className="unit-summary-stat">
          <p className="unit-stat-value text-sprout">{summary.byRisk.normal}</p>
          <p className="unit-stat-label">Normal Status</p>
        </div>
        <div className="unit-summary-stat">
          <p className="unit-stat-value text-canary">{summary.byRisk.elevated}</p>
          <p className="unit-stat-label">Elevated Risk</p>
        </div>
        <div className="unit-summary-stat">
          <p className="unit-stat-value text-blush">{summary.byRisk.high}</p>
          <p className="unit-stat-label">High Risk</p>
        </div>
        <div className="unit-summary-stat">
          <p className="unit-stat-value" style={{ color: 'var(--color-danger)' }}>{summary.byRisk.critical}</p>
          <p className="unit-stat-label">Critical Review</p>
        </div>
      </div>
    </Panel>
  );
}
