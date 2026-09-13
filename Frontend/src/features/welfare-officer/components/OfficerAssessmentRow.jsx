import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getConcernMeta } from '../../../shared/utils/riskMeta.js';
import { OfficerAssessmentDetail } from './OfficerAssessmentDetail.jsx';

export function OfficerAssessmentRow({ assessment }) {
  const [expanded, setExpanded] = useState(false);

  const isCompleted = assessment.status === 'completed';
  const personName = assessment.personnelId?.personalDetails?.name ||
    assessment.personnelId?.username ||
    'Personnel Profile';
  const rank = assessment.personnelId?.serviceDetails?.rank;
  const unit = assessment.personnelId?.serviceDetails?.unit;

  const concernMeta = isCompleted && assessment.aiAnalysis?.concernLevel
    ? getConcernMeta(assessment.aiAnalysis.concernLevel)
    : null;

  const dateStr = new Date(assessment.assignedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className={`officer-assessment-row-card ${expanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className="officer-assessment-row-header"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="officer-row-person-info">
          <div className="officer-row-avatar">
            <User size={16} strokeWidth={2.5} />
          </div>
          <div>
            <div className="officer-row-name-line">
              <span className="officer-row-name">{personName}</span>
              {rank && <span className="personnel-rank-pill">{rank}</span>}
              {unit && <span className="officer-row-unit">· {unit}</span>}
            </div>
            <span className="officer-row-date">
              <Clock size={12} /> Assigned {dateStr} · {assessment.questions?.length || 0} Questions
            </span>
          </div>
        </div>

        <div className="officer-row-status-group">
          {isCompleted ? (
            <span className="officer-status-pill completed">
              <CheckCircle2 size={13} />
              Completed
            </span>
          ) : (
            <span className="officer-status-pill pending">
              <Clock size={13} />
              Pending Response
            </span>
          )}

          {concernMeta && (
            <span
              className="roster-risk-badge"
              style={{
                color: concernMeta.color,
                borderColor: concernMeta.color,
                backgroundColor: concernMeta.bg
              }}
            >
              {concernMeta.badge} Concern
            </span>
          )}

          <div className="officer-row-toggle-icon">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="officer-assessment-row-body">
          <OfficerAssessmentDetail assessment={assessment} />
        </div>
      )}
    </div>
  );
}

export default OfficerAssessmentRow;
