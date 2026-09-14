import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Lightbulb, Tags, Plus } from 'lucide-react';
import { getConcernMeta } from '../../../shared/utils/riskMeta.js';

export function OfficerAssessmentDetail({ assessment, onAssignNew }) {
  const isCompleted = assessment.status === 'completed';
  const concernMeta = isCompleted && assessment.aiAnalysis?.concernLevel
    ? getConcernMeta(assessment.aiAnalysis.concernLevel)
    : null;

  const answersMap = (assessment.answers || []).reduce((acc, a) => {
    acc[a.questionId] = a.answerText;
    return acc;
  }, {});

  const assignedDateStr = new Date(assessment.assignedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const completedDateStr = assessment.completedAt
    ? new Date(assessment.completedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const personnelId = assessment.personnelId?._id || assessment.personnelId?.id || assessment.personnelId;

  return (
    <div className="officer-assessment-detail-panel">
      <div className="officer-assessment-detail-meta">
        <span className="officer-detail-meta-chip">
          <Clock size={13} />
          Assigned: {assignedDateStr}
        </span>
        {completedDateStr && (
          <span className="officer-detail-meta-chip">
            <CheckCircle2 size={13} />
            Completed: {completedDateStr}
          </span>
        )}
        {onAssignNew && personnelId && (
          <button
            type="button"
            className="officer-assign-chip-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAssignNew(personnelId);
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Assign Follow-up Assessment</span>
          </button>
        )}
      </div>

      {isCompleted && assessment.aiAnalysis && (
        <div className="officer-ai-analysis-card">
          <div className="officer-ai-analysis-header">
            <div className="officer-ai-title-group">
              <span className="officer-ai-tag">AI Welfare Synthesis</span>
              {concernMeta && (
                <span
                  className="roster-risk-badge"
                  style={{
                    color: concernMeta.color,
                    borderColor: concernMeta.color,
                    backgroundColor: concernMeta.bg
                  }}
                >
                  {concernMeta.title}
                </span>
              )}
            </div>
          </div>

          {assessment.aiAnalysis.summary && (
            <p className="officer-ai-summary">{assessment.aiAnalysis.summary}</p>
          )}

          {assessment.aiAnalysis.contributingFactors?.length > 0 && (
            <div className="officer-ai-factors-wrapper">
              <span className="officer-ai-factors-label">
                <Tags size={13} /> Contributing Factors
              </span>
              <div className="officer-ai-factors-chips">
                {assessment.aiAnalysis.contributingFactors.map((factor, idx) => (
                  <span key={idx} className="officer-factor-chip">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {assessment.aiAnalysis.suggestedAction && (
            <div className="officer-ai-action-box">
              <Lightbulb size={16} className="officer-action-icon" />
              <div>
                <p className="officer-action-title">Recommended Welfare Action</p>
                <p className="officer-action-text">{assessment.aiAnalysis.suggestedAction}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="officer-qa-section">
        <h4 className="officer-qa-title">Questionnaire & Personnel Responses</h4>
        <div className="officer-qa-list">
          {(assessment.questions || []).map((q, idx) => {
            const answer = answersMap[q.questionId];
            return (
              <div key={q.questionId || idx} className="officer-qa-item">
                <div className="officer-qa-question">
                  <span className="officer-qa-num">Q{idx + 1}</span>
                  <div>
                    <span className="assign-assessment-category">{q.category}</span>
                    <p className="officer-q-text">{q.text}</p>
                  </div>
                </div>
                <div className="officer-qa-answer">
                  <span className="officer-a-label">Personnel Response:</span>
                  <p className="officer-a-text">
                    {answer ? answer : <em>Pending response from personnel...</em>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OfficerAssessmentDetail;
