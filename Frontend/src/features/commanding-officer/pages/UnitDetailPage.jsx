import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import CommandSidebar from '../components/CommandSidebar.jsx';
import { UnitHeaderCard } from '../components/UnitHeaderCard.jsx';
import { OrganizationalNotesPanel } from '../components/OrganizationalNotesPanel.jsx';
import { AddOrgNoteForm } from '../components/AddOrgNoteForm.jsx';
import { useUnitDetail } from '../hooks/useUnitDetail.js';

import { WellnessOverviewPanel } from '../../analytics/components/WellnessOverviewPanel.jsx';
import { StressStatusPanel } from '../../analytics/components/StressStatusPanel.jsx';
import { WellnessRiskPanel } from '../../analytics/components/WellnessRiskPanel.jsx';
import { WellnessTrendsPanel } from '../../analytics/components/WellnessTrendsPanel.jsx';
import { useStressStatus } from '../../analytics/hooks/useStressStatus.js';
import { useWellnessRisk } from '../../analytics/hooks/useWellnessRisk.js';
import { useWellnessTrends } from '../../analytics/hooks/useWellnessTrends.js';
import { useWellnessScores } from '../../analytics/hooks/useWellnessScores.js';
import { useWellnessOverview } from '../../analytics/hooks/useWellnessOverview.js';

import '../../analytics/styles/analytics.css';
import '../styles/commandingOfficer.css';

export function UnitDetailPage({ onLogout }) {
  const { unitName } = useParams();
  const [trendsRange, setTrendsRange] = useState('30D');

  const {
    unit,
    department,
    personnelCount,
    worstCaseRiskLevel,
    entries,
    unitStats,
    notes,
    request,
    reload
  } = useUnitDetail(unitName);

  const { currentStress, stressCategory } = useStressStatus(entries, unitStats);
  const { riskMeta } = useWellnessRisk(entries, unitStats);
  const { trendData, labels: trendLabels } = useWellnessTrends(entries, trendsRange);
  const { overallWellnessScore } = useWellnessScores(entries);
  const { overview } = useWellnessOverview({
    currentStress,
    stressCategory,
    riskMeta,
    statsData: unitStats,
    overallWellnessScore,
    entries
  });

  const req = request || detailRequest || { loading: false, error: null };

  return (
    <main className="officer-page-container analytics-scroll">
      <div className="officer-flex-wrapper">
        <CommandSidebar onLogout={onLogout} />
        <section className="officer-section">
          <div className="officer-content-wrapper">
            {req.loading && (
              <p className="obs-desc">Loading unit intelligence...</p>
            )}

            {req.error && (
              <p className="obs-desc" style={{ color: 'var(--color-danger)' }}>
                {req.error}
              </p>
            )}

            {!req.loading && !req.error && unit && (
              <>
                <UnitHeaderCard
                  unit={unit}
                  department={department}
                  personnelCount={personnelCount}
                  worstCaseRiskLevel={worstCaseRiskLevel}
                />

                <WellnessOverviewPanel overview={overview} />

                <div className="two-column-layout">
                  <StressStatusPanel currentStress={currentStress} stressCategory={stressCategory} />
                  <WellnessRiskPanel riskMeta={riskMeta} />
                </div>

                <WellnessTrendsPanel
                  range={trendsRange}
                  setRange={setTrendsRange}
                  trendData={trendData}
                  labels={trendLabels}
                />

                <OrganizationalNotesPanel notes={notes} />
                <AddOrgNoteForm unitName={unit} onAdded={reload} />
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default UnitDetailPage;
