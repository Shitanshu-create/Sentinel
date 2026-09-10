import React, { useState } from 'react';
import AppSidebar from '../../../components/AppSidebar.jsx';
import SidePanel from '../../../components/SidePanel.jsx';
import '../styles/analytics.css';

// Hooks
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';
import { useTimelineData } from '../hooks/useTimelineData.js';
import { useWellnessScores } from '../hooks/useWellnessScores.js';
import { useHeatmapDays } from '../hooks/useHeatmapDays.js';
import { useObservations } from '../hooks/useObservations.js';
import { useStressStatus } from '../hooks/useStressStatus.js';
import { useWellnessRisk } from '../hooks/useWellnessRisk.js';
import { useWellnessTrends } from '../hooks/useWellnessTrends.js';
import { useWellnessOverview } from '../hooks/useWellnessOverview.js';

// Components
import { AnalyticsHeader } from '../components/AnalyticsHeader.jsx';
import { AnalyticsFooter } from '../components/AnalyticsFooter.jsx';
import { StatsGrid } from '../components/StatsGrid.jsx';
import { MoodTimelinePanel } from '../components/MoodTimelinePanel.jsx';
import { CurrentStreakPanel } from '../components/CurrentStreakPanel.jsx';
import { ObservationsPanel } from '../components/ObservationsPanel.jsx';
import { AdvicePanel } from '../components/AdvicePanel.jsx';
import { WellnessScorePanel } from '../components/WellnessScorePanel.jsx';
import { StressStatusPanel } from '../components/StressStatusPanel.jsx';
import { WellnessRiskPanel } from '../components/WellnessRiskPanel.jsx';
import { WellnessTrendsPanel } from '../components/WellnessTrendsPanel.jsx';
import { WellnessOverviewPanel } from '../components/WellnessOverviewPanel.jsx';

function AnalyticsPage({ onOpenWriting, onOpenChat, onLogout, entries, onSelectEntry }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState('Past Month');
  const [trendsRange, setTrendsRange] = useState('30D');

  const { statsData, insights, statsRequest, insightsRequest } = useAnalyticsData(entries);
  const { timeline, timelineLabels } = useTimelineData(entries, range);
  const { heatmapDays, computedCurrentStreak } = useHeatmapDays(entries);
  const { computedWellnessScores, overallWellnessScore } = useWellnessScores(entries);
  const { currentStress, stressCategory } = useStressStatus(entries, statsData);
  const { riskMeta } = useWellnessRisk(entries, statsData);
  const { trendData, labels: trendLabels } = useWellnessTrends(entries, trendsRange);
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
    <main className="analytics-page-container analytics-scroll">
      <div className="analytics-flex-wrapper">
        <AppSidebar
          active="analytics"
          panelOpen={sidebarOpen}
          onTogglePanel={() => setSidebarOpen((value) => !value)}
          onNewEntry={onOpenWriting}
          onOpenWriting={onOpenWriting}
          onOpenChat={onOpenChat}
          onOpenAnalytics={undefined}
          onLogout={onLogout}
        />
        <SidePanel 
          open={sidebarOpen} 
          entries={entries} 
          onSelectEntry={onSelectEntry} 
          onClose={() => setSidebarOpen(false)}
        />
        <section className={`analytics-section ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="analytics-content-wrapper">
            <AnalyticsHeader statsRequest={statsRequest} insightsRequest={insightsRequest} />

            <StatsGrid statsData={statsData} />

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

            <div className="charts-layout">
              <MoodTimelinePanel range={range} setRange={setRange} timeline={timeline} labels={timelineLabels[range]} />
              <CurrentStreakPanel currentStreak={computedCurrentStreak} heatmapDays={heatmapDays} />
            </div>

            <div className="two-column-layout">
              <ObservationsPanel 
                insightsRequest={insightsRequest} 
                activeObservations={activeObservations} 
                expandedObservation={expandedObservation} 
                setExpandedObservation={setExpandedObservation} 
              />
              <AdvicePanel 
                insightsRequest={insightsRequest} 
                visibleAdvice={visibleAdvice} 
                doneAdvice={doneAdvice} 
                setDoneAdvice={setDoneAdvice} 
                setDismissedAdvice={setDismissedAdvice} 
              />
            </div>

            <WellnessScorePanel 
              overallWellnessScore={overallWellnessScore} 
              computedWellnessScores={computedWellnessScores} 
            />

            <AnalyticsFooter />
          </div>
        </section>
      </div>
    </main>
  );
}

export default AnalyticsPage;
