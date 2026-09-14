import React, { useState, useEffect } from 'react';
import { X, ClipboardCheck, User, Check, AlertCircle } from 'lucide-react';
import { useQuestionBank } from '../hooks/useQuestionBank.js';
import { useRoster } from '../hooks/useRoster.js';
import { assignAssessment } from '../services/welfareOfficer.api.js';

export function AssignAssessmentModal({ isOpen, onClose, onAssigned, initialPersonnelId = null }) {
  const { questions, bankRequest } = useQuestionBank();
  const { roster, rosterRequest } = useRoster();

  const [selectedPersonnelId, setSelectedPersonnelId] = useState(initialPersonnelId || '');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedPersonnelId(initialPersonnelId || '');
      setSelectedQuestions([]);
      setError(null);
      setSuccessMsg(false);
    }
  }, [isOpen, initialPersonnelId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleQuestion = (id) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(id)) return prev.filter((q) => q !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('officer-modal-backdrop')) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPersonnelId) {
      setError('Please select an officer or personnel member.');
      return;
    }
    if (selectedQuestions.length < 4) {
      setError('Please select at least 4 questions for the assessment.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await assignAssessment(selectedPersonnelId, { questionIds: selectedQuestions });
      setSuccessMsg(true);
      onAssigned?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to assign assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPerson = roster.find((p) => p.id === selectedPersonnelId);

  return (
    <div className="officer-modal-backdrop" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="officer-modal-dialog">
        <div className="officer-modal-header">
          <div>
            <h3 className="officer-modal-title">Assign Wellness Assessment</h3>
            <p className="officer-modal-subtitle">
              Dispatch a targeted welfare questionnaire to unit personnel
            </p>
          </div>
          <button
            type="button"
            className="officer-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="officer-modal-form">
          <div className="officer-modal-section">
            <label htmlFor="personnel-select" className="add-note-label">
              Select Officer / Personnel
            </label>
            {rosterRequest.loading ? (
              <p className="obs-desc">Loading unit roster...</p>
            ) : rosterRequest.error ? (
              <p className="obs-desc text-danger">{rosterRequest.error}</p>
            ) : (
              <div className="officer-select-wrapper">
                <select
                  id="personnel-select"
                  className="add-note-select officer-personnel-select"
                  value={selectedPersonnelId}
                  onChange={(e) => {
                    setSelectedPersonnelId(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={Boolean(initialPersonnelId)}
                  required
                >
                  <option value="" style={{ backgroundColor: '#161b24', color: '#f1f5f9' }}>
                    -- Choose Personnel from Roster --
                  </option>
                  {roster.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      style={{ backgroundColor: '#161b24', color: '#f1f5f9' }}
                    >
                      {p.rank ? `${p.rank} ` : ''}{p.name} {p.unit ? `(${p.unit})` : ''}
                    </option>
                  ))}
                </select>
                {selectedPerson && (
                  <div className="officer-selected-preview">
                    <User size={14} />
                    <span>
                      Target: <strong>{selectedPerson.rank ? `${selectedPerson.rank} ` : ''}{selectedPerson.name}</strong>
                      {selectedPerson.postingLocation ? ` · ${selectedPerson.postingLocation}` : ''}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="officer-modal-section">
            <div className="officer-modal-section-header">
              <span className="add-note-label">Select 4–5 Questionnaire Topics</span>
              <span className={`assign-assessment-counter ${selectedQuestions.length < 4 ? 'insufficient' : 'ready'}`}>
                {selectedQuestions.length} / 5 selected (min 4)
              </span>
            </div>

            {bankRequest.loading && <p className="obs-desc">Loading question bank...</p>}
            {bankRequest.error && <p className="obs-desc text-danger">{bankRequest.error}</p>}

            {!bankRequest.loading && !bankRequest.error && (
              <div className="assign-assessment-question-list officer-modal-questions-scroll">
                {questions.map((q) => {
                  const isChecked = selectedQuestions.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`assign-assessment-question-item ${isChecked ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleQuestion(q.id)}
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
            )}
          </div>

          {error && (
            <div className="officer-modal-alert error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="officer-modal-alert success">
              <Check size={16} />
              <span>Assessment dispatched successfully!</span>
            </div>
          )}

          <div className="officer-modal-actions">
            <button
              type="button"
              className="officer-modal-cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPersonnelId || selectedQuestions.length < 4 || submitting}
              className="add-note-submit-btn"
            >
              <ClipboardCheck size={16} strokeWidth={2.5} />
              <span>
                {submitting
                  ? 'Dispatching...'
                  : `Assign Assessment (${selectedQuestions.length} selected)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignAssessmentModal;
