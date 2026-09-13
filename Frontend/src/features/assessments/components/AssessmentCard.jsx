import React, { useState } from 'react';
import { Clock, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, ShieldAlert } from 'lucide-react';
import { AssessmentForm } from './AssessmentForm.jsx';

export function AssessmentCard({ assessment, onCompleted }) {
  const isCompleted = assessment.status === 'completed';
  const [isOpen, setIsOpen] = useState(!isCompleted); // Default open if pending

  const assignedDate = new Date(assessment.assignedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const completedDate = assessment.completedAt
    ? new Date(assessment.completedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : null;

  const answersMap = (assessment.answers || []).reduce((acc, a) => {
    acc[a.questionId] = a.answerText;
    return acc;
  }, {});

  return (
    <div className={`assessment-card-sketch ${isCompleted ? 'completed' : 'pending'}`}>
      <div className="assessment-card-header">
        <div className="assessment-card-title-group">
          {!isCompleted ? (
            <span className="assessment-badge-mandatory">
              <ShieldAlert size={14} strokeWidth={2.5} />
              Mandatory Assessment
            </span>
          ) : (
            <span className="assessment-badge-completed">
              <CheckCircle2 size={14} strokeWidth={2.5} />
              Completed
            </span>
          )}
          <span className="assessment-meta-date">
            <Clock size={12} /> Assigned {assignedDate} · {assessment.questions?.length || 0} Questions
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="assessment-card-action-btn"
        >
          <span>{!isCompleted ? (isOpen ? 'Hide Questions' : 'Start Assessment') : (isOpen ? 'Hide Answers' : 'View Submitted Answers')}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!isCompleted && !isOpen && (
        <div className="assessment-pending-callout">
          <p>
            Your Unit Welfare Officer has assigned this welfare review. Your direct responses help provide appropriate operational support and rest scheduling.
          </p>
        </div>
      )}

      {isOpen && (
        <div className="assessment-card-body">
          {!isCompleted ? (
            <AssessmentForm assessment={assessment} onSubmitted={onCompleted} />
          ) : (
            <div className="assessment-completed-qa-list">
              <div className="assessment-completed-meta">
                <CheckCircle2 size={15} className="text-sprout" />
                <span>Submitted on {completedDate}. Your answers are confidential and under welfare officer review.</span>
              </div>
              {(assessment.questions || []).map((q, idx) => (
                <div key={q.questionId || idx} className="assessment-qa-review-item">
                  <div className="assessment-review-q">
                    <span className="assign-assessment-category">{q.category}</span>
                    <p className="assessment-review-q-text">Q{idx + 1}. {q.text}</p>
                  </div>
                  <div className="assessment-review-a">
                    <span className="officer-a-label">Your Response:</span>
                    <p className="assessment-review-a-text">{answersMap[q.questionId] || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AssessmentCard;
