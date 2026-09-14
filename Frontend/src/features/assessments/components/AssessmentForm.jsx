import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { useSubmitAssessment } from '../hooks/useSubmitAssessment.js';

export function AssessmentForm({ assessment, onSubmitted }) {
  const [answers, setAnswers] = useState(
    Object.fromEntries((assessment.questions || []).map((q) => [q.questionId, '']))
  );
  const [clientError, setClientError] = useState(null);

  const { submit, submitting, error: submitError } = useSubmitAssessment(
    assessment._id,
    onSubmitted
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError(null);

    const payload = Object.entries(answers).map(([questionId, answerText]) => ({
      questionId,
      answerText: (answerText || '').trim()
    }));

    const unanswered = payload.find((a) => !a.answerText);
    if (unanswered) {
      setClientError('Please answer all questions before submitting your assessment.');
      return;
    }

    submit(payload);
  };

  const error = clientError || submitError;

  return (
    <form onSubmit={handleSubmit} className="assessment-active-form">
      <div className="assessment-questions-container">
        {(assessment.questions || []).map((q, idx) => (
          <div key={q.questionId || idx} className="assessment-question-box">
            <div className="assessment-question-header">
              <span className="assessment-q-number">Question {idx + 1}</span>
              <span className="assign-assessment-category">{q.category}</span>
            </div>
            <p className="assessment-q-prompt">{q.text}</p>
            <textarea
              value={answers[q.questionId] || ''}
              onChange={(e) => {
                setAnswers((prev) => ({ ...prev, [q.questionId]: e.target.value }));
                if (clientError) setClientError(null);
              }}
              placeholder="Reflect honestly on your recent experiences and operational routine..."
              rows={3}
              maxLength={2000}
              className="assessment-textarea"
              required
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="assessment-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="assessment-submit-bar">
        <button
          type="submit"
          disabled={submitting}
          className="add-note-submit-btn"
        >
          <Send size={16} strokeWidth={2.5} />
          <span>{submitting ? 'Submitting Confidential Responses...' : 'Submit Assessment'}</span>
        </button>
      </div>
    </form>
  );
}

export default AssessmentForm;
