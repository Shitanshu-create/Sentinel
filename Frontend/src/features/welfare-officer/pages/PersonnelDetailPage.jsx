import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import OfficerSidebar from '../components/OfficerSidebar.jsx';
import { PersonnelHeaderCard } from '../components/PersonnelHeaderCard.jsx';
import { WelfareNotesPanel } from '../components/WelfareNotesPanel.jsx';
import { AddNoteForm } from '../components/AddNoteForm.jsx';
import { usePersonnelDetail } from '../hooks/usePersonnelDetail.js';

// Reused components & hooks from analytics feature
import { WellnessOverviewPanel } from '../../analytics/components/WellnessOverviewPanel.jsx';
import { StressStatusPanel } from '../../analytics/components/StressStatusPanel.jsx';
import { WellnessRiskPanel } from '../../analytics/components/WellnessRiskPanel.jsx';
import { WellnessTrendsPanel } from '../../analytics/components/WellnessTrendsPanel.jsx';
import { ObservationsPanel } from '../../analytics/components/ObservationsPanel.jsx';
import { AdvicePanel } from '../../analytics/components/AdvicePanel.jsx';
import { useStressStatus } from '../../analytics/hooks/useStressStatus.js';
import { useWellnessRisk } from '../../analytics/hooks/useWellnessRisk.js';
import { useWellnessTrends } from '../../analytics/hooks/useWellnessTrends.js';
import { useWellnessScores } from '../../analytics/hooks/useWellnessScores.js';
import { useWellnessOverview } from '../../analytics/hooks/useWellnessOverview.js';
import { useObservations } from '../../analytics/hooks/useObservations.js';

import '../../analytics/styles/analytics.css';
import '../styles/welfareOfficer.css';

export function PersonnelDetailPage({ onLogout }) {
  const { id } = useParams();
  const [trendsRange, setTrendsRange] = useState('30D');

  const { person, statsData, entries, insights, notes, detailRequest, reload } = usePersonnelDetail(id);

  const { currentStress, stressCategory } = useStressStatus(entries, statsData);
  const { riskMeta } = useWellnessRisk(entries, statsData);
  const { trendData, labels: trendLabels } = useWellnessTrends(entries, trendsRange);
  const { overallWellnessScore } = useWellnessScores(entries);
  const { overview } = useWellnessOverview({
    currentStress,
    stressCategory,
    riskMeta,
    statsData,
    overallWellnessScore,
    entries
  });
  const {
    activeObservations,
    visibleAdvice,
    expandedObservation,
    setExpandedObservation,
    doneAdvice,
    setDoneAdvice,
    setDismissedAdvice
  } = useObservations(insights);

  return (
    <main className="officer-page-container analytics-scroll">
      <div className="officer-flex-wrapper">
        <OfficerSidebar onLogout={onLogout} />
        <section className="officer-section">
          <div className="officer-content-wrapper">
            {detailRequest.loading && (
              <p className="obs-desc">Loading personnel welfare intelligence...</p>
            )}

            {detailRequest.error && (
              <p className="obs-desc" style={{ color: 'var(--color-danger)' }}>
                {detailRequest.error}
              </p>
            )}

            {!detailRequest.loading && !detailRequest.error && person && (
              <>
                <PersonnelHeaderCard person={person} />

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

                <div className="two-column-layout">
                  <ObservationsPanel
                    insightsRequest={detailRequest}
                    activeObservations={activeObservations}
                    expandedObservation={expandedObservation}
                    setExpandedObservation={setExpandedObservation}
                  />
                  <AdvicePanel
                    insightsRequest={detailRequest}
                    visibleAdvice={visibleAdvice}
                    doneAdvice={doneAdvice}
                    setDoneAdvice={setDoneAdvice}
                    setDismissedAdvice={setDismissedAdvice}
                  />
                </div>

                <WelfareNotesPanel notes={notes} />
                <AddNoteForm personnelId={id} onAdded={reload} />
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default PersonnelDetailPage;
