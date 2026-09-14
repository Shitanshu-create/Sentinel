import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import AppSidebar from '../../../components/AppSidebar.jsx';
import { AssessmentCard } from '../components/AssessmentCard.jsx';
import { useMyAssessments } from '../hooks/useMyAssessments.js';
import { Panel } from '../../analytics/components/Panel.jsx';
import '../styles/assessments.css';

export function PersonnelAssessmentsPage({
  onLogout,
  onOpenWriting,
  onOpenChat,
  onOpenAnalytics,
  onOpenAssessments,
  onOpenProfile,
  pendingAssessments
}) {
  const { assessments, pendingCount, assessmentsRequest, reload } = useMyAssessments();
  const effectivePending = pendingAssessments ?? pendingCount;

  return (
    <main className="assessments-page-container analytics-scroll">
      <AppSidebar
        active="assessments"
        onOpenWriting={onOpenWriting}
        onOpenChat={onOpenChat}
        onOpenAnalytics={onOpenAnalytics}
        onOpenAssessments={onOpenAssessments}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        pendingAssessments={effectivePending}
      />
      <section className="assessments-section">
        <div className="assessments-header-group">
          <h1 className="assessments-page-title">Wellness Assessments</h1>
          <p className="assessments-page-subtitle">
            Officer-directed wellbeing questionnaires for confidential workload and stress monitoring
          </p>
        </div>

        {effectivePending > 0 && (
          <div className="assessments-mandatory-banner">
            <ShieldAlert size={20} className="text-danger flex-shrink-0" />
            <span>
              You have <strong>{effectivePending} mandatory assessment{effectivePending > 1 ? 's' : ''}</strong> requiring your input. Please complete them as soon as possible.
            </span>
          </div>
        )}

        {assessmentsRequest.loading && (
          <p className="obs-desc">Loading assigned wellness assessments...</p>
        )}

        {assessmentsRequest.error && (
          <p className="obs-desc" style={{ color: 'var(--color-danger)' }}>
            {assessmentsRequest.error}
          </p>
        )}

        {!assessmentsRequest.loading && !assessmentsRequest.error && (
          <>
            {assessments.length === 0 ? (
              <Panel padding="p-5" className="roster-empty-panel">
                <p className="obs-desc">
                  No wellness assessments assigned to you right now. When your Unit Welfare Officer assigns an assessment, it will appear here.
                </p>
              </Panel>
            ) : (
              assessments.map((a) => (
                <AssessmentCard key={a._id} assessment={a} onCompleted={reload} />
              ))
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default PersonnelAssessmentsPage;
