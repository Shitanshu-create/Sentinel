import React, { useMemo } from 'react';
import { Panel } from '../../analytics/components/Panel.jsx';

export function ForceSummaryPanel({ force, units = [] }) {
  const summary = useMemo(() => {
    const list = units || [];
    const totalPersonnel = list.reduce((sum, u) => sum + (u.personnelCount || 0), 0);
    const byRisk = { normal: 0, elevated: 0, high: 0, critical: 0 };
    list.forEach((u) => {
      const risk = u.worstCaseRiskLevel || u.riskLevel || 'normal';
      byRisk[risk] = (byRisk[risk] || 0) + 1;
    });
    return { totalPersonnel, totalUnits: list.length, byRisk };
  }, [units]);

  const forceTitle = force ? `${force} Welfare Summary` : 'Force Welfare Summary';

  return (
    <Panel className="unit-summary-panel" padding="p-5">
      <div className="unit-summary-header">
        <h2 className="obs-title">{forceTitle}</h2>
        <p className="unit-summary-sub">Aggregate risk distribution across all units in your force</p>
      </div>
      <div className="unit-summary-grid">
        <div className="unit-summary-stat">
          <p className="unit-stat-value">{summary.totalPersonnel}</p>
          <p className="unit-stat-label">Total Personnel</p>
        </div>
        <div className="unit-summary-stat">
          <p className="unit-stat-value">{summary.totalUnits}</p>
          <p className="unit-stat-label">Active Units</p>
        </div>
        <div className="unit-summary-stat">
          <p className="unit-stat-value text-sprout">{summary.byRisk.normal}</p>
          <p className="unit-stat-label">Normal Units</p>
        </div>
        <div className="unit-summary-stat">
          <p className="unit-stat-value text-canary">{summary.byRisk.elevated}</p>
          <p className="unit-stat-label">Elevated Units</p>
        </div>
        <div className="unit-summary-stat">
          <p className="unit-stat-value" style={{ color: 'var(--color-danger)' }}>
            {summary.byRisk.high + summary.byRisk.critical}
          </p>
          <p className="unit-stat-label">High/Critical Units</p>
        </div>
      </div>
    </Panel>
  );
}

export const DepartmentSummaryPanel = ForceSummaryPanel;
export default ForceSummaryPanel;
