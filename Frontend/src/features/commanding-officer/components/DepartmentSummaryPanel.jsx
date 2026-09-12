import React, { useMemo } from 'react';
import { Panel } from '../../analytics/components/Panel.jsx';

export function DepartmentSummaryPanel({ units }) {
  const summary = useMemo(() => {
    const totalPersonnel = units.reduce((sum, u) => sum + (u.personnelCount || 0), 0);
    const byRisk = { normal: 0, elevated: 0, high: 0, critical: 0 };
    units.forEach((u) => { byRisk[u.riskLevel || 'normal'] = (byRisk[u.riskLevel || 'normal'] || 0) + 1; });
    return { totalPersonnel, totalUnits: units.length, byRisk };
  }, [units]);

  return (
    <Panel className="unit-summary-panel" padding="p-5">
      <div className="unit-summary-header">
        <h2 className="obs-title">Department Welfare Summary</h2>
        <p className="unit-summary-sub">Aggregate risk distribution across all units in your department</p>
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

export default DepartmentSummaryPanel;
