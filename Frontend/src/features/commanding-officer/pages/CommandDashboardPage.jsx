import React from 'react';
import CommandSidebar from '../components/CommandSidebar.jsx';
import { DepartmentSummaryPanel } from '../components/DepartmentSummaryPanel.jsx';
import { UnitTable } from '../components/UnitTable.jsx';
import { useUnitsSummary } from '../hooks/useUnitsSummary.js';
import '../styles/commandingOfficer.css';

export function CommandDashboardPage({ onLogout }) {
  const { department, units, request, unitsRequest } = useUnitsSummary();
  const req = request || unitsRequest || { loading: false, error: null };

  return (
    <main className="officer-page-container analytics-scroll">
      <div className="officer-flex-wrapper">
        <CommandSidebar onLogout={onLogout} />
        <section className="officer-section">
          <div className="officer-content-wrapper">
            <div>
              <h1 className="officer-page-title">Department Command Headquarters</h1>
              <p className="unit-summary-sub">
                Aggregate unit operational readiness, systemic stress trends, and organizational posture
              </p>
            </div>

            {req.loading && (
              <p className="obs-desc">Loading department units...</p>
            )}

            {req.error && (
              <p className="obs-desc" style={{ color: 'var(--color-danger)' }}>
                {req.error}
              </p>
            )}

            {!req.loading && !req.error && (
              <>
                <DepartmentSummaryPanel department={department} units={units} />
                <UnitTable units={units} />
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default CommandDashboardPage;
