import React, { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';
import { useQuestionBank } from '../hooks/useQuestionBank.js';
import { useAssignAssessment } from '../hooks/useAssignAssessment.js';

export function AssignAssessmentForm({ personnelId, onAssigned }) {
  const { questions, bankRequest } = useQuestionBank();
  const [selected, setSelected] = useState([]);
  const [successMsg, setSuccessMsg] = useState(false);
  const { submit, submitting, error } = useAssignAssessment(personnelId, () => {
    setSelected([]);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
    onAssigned?.();
  });

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((q) => q !== id);
      if (prev.length >= 5) return prev; // cap at 5
      return [...prev, id];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected.length < 4 || submitting) return;
    submit(selected);
  };

  return (
    <Panel className="add-note-panel assign-assessment-panel" padding="p-5">
      <div className="add-note-header">
        <h2 className="obs-title">Send Wellness Assessment</h2>
        <p className="add-note-sub">
          Select 4–5 targeted questions to send. This assessment will be marked mandatory for personnel completion.
        </p>
      </div>

      {bankRequest.loading && <p className="obs-desc">Loading question bank...</p>}
      {bankRequest.error && (
        <p className="obs-desc" style={{ color: 'var(--color-danger)' }}>{bankRequest.error}</p>
      )}

      {!bankRequest.loading && !bankRequest.error && (
        <form onSubmit={handleSubmit} className="add-note-form">
          <div className="assign-assessment-question-list">
            {questions.map((q) => {
              const isChecked = selected.includes(q.id);
              return (
                <label
                  key={q.id}
                  className={`assign-assessment-question-item ${isChecked ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(q.id)}
                    className="assign-assessment-checkbox"
                  />
                  <div className="assign-assessment-content">
                    <span className="assign-assessment-category">{q.category}</span>
                    <span className="assign-assessment-text">{q.text}</span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="assign-assessment-status-row">
            <span className={`assign-assessment-counter ${selected.length < 4 ? 'insufficient' : 'ready'}`}>
              Selected: {selected.length} / 5 (minimum 4 required)
            </span>
          </div>

          {error && <p className="add-note-error">{error}</p>}
          {successMsg && (
            <p className="obs-desc text-sprout" style={{ margin: 0, fontWeight: 700 }}>
              Assessment successfully assigned to personnel!
            </p>
          )}

          <div className="add-note-actions">
            <button
              type="submit"
              disabled={selected.length < 4 || submitting}
              className="add-note-submit-btn"
            >
              <ClipboardCheck size={16} strokeWidth={2.5} />
              <span>{submitting ? 'Assigning...' : `Send Assessment (${selected.length} selected)`}</span>
            </button>
          </div>
        </form>
      )}
    </Panel>
  );
}

export default AssignAssessmentForm;
