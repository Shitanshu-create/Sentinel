import React from 'react';
import OfficerSidebar from '../components/OfficerSidebar.jsx';
import { UnitSummaryPanel } from '../components/UnitSummaryPanel.jsx';
import { RosterTable } from '../components/RosterTable.jsx';
import { useRoster } from '../hooks/useRoster.js';
import '../styles/welfareOfficer.css';

export function WelfareOfficerDashboardPage({ onLogout }) {
  const { roster, rosterRequest } = useRoster();

  return (
    <main className="officer-page-container analytics-scroll">
      <div className="officer-flex-wrapper">
        <OfficerSidebar onLogout={onLogout} />
        <section className="officer-section">
          <div className="officer-content-wrapper">
            <div>
              <h1 className="officer-page-title">Welfare Officer Command Dashboard</h1>
              <p className="unit-summary-sub">
                Confidential personnel monitoring, stress index patterns, and welfare management
              </p>
            </div>

            {rosterRequest.loading && (
              <p className="obs-desc">Loading unit roster data...</p>
            )}

            {rosterRequest.error && (
              <p className="obs-desc" style={{ color: 'var(--color-danger)' }}>
                {rosterRequest.error}
              </p>
            )}

            {!rosterRequest.loading && !rosterRequest.error && (
              <>
                <UnitSummaryPanel roster={roster} />
                <RosterTable roster={roster} />
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default WelfareOfficerDashboardPage;
