import React, { useState } from 'react';
import { Send, PlusCircle } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';
import { useAddWelfareNote } from '../hooks/useAddWelfareNote.js';

const ACTION_OPTIONS = [
  { value: 'confidential_check', label: 'Confidential Welfare Check' },
  { value: 'workload_review', label: 'Workload & Schedule Review' },
  { value: 'leave_review', label: 'Leave Review & Rest Recommendation' },
  { value: 'rest_recommendation', label: 'Mandatory Rest Period' },
  { value: 'counseling_referral', label: 'Counseling / Medical Referral' },
  { value: 'general_note', label: 'General Welfare Note' }
];

export function AddNoteForm({ personnelId, onAdded }) {
  const [note, setNote] = useState('');
  const [actionType, setActionType] = useState('confidential_check');

  const { submit, submitting, error } = useAddWelfareNote(personnelId, () => {
    setNote('');
    onAdded?.();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim() || submitting) return;
    submit({ note: note.trim(), actionType });
  };

  return (
    <Panel className="add-note-panel" padding="p-5">
      <div className="add-note-header">
        <h2 className="obs-title">Log Welfare Action / Observation</h2>
        <p className="add-note-sub">Recorded notes are restricted to authorized welfare personnel and unit commanders</p>
      </div>

      <form onSubmit={handleSubmit} className="add-note-form">
        <div className="add-note-type-wrapper">
          <label className="add-note-label">Intervention Category</label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="add-note-select"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="add-note-textarea-wrapper">
          <label className="add-note-label">Observation / Action Details</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record specific observations, recommended interventions, workload adjustments, or counseling follow-ups..."
            rows={4}
            maxLength={2000}
            className="add-note-textarea"
            required
          />
        </div>

        {error && (
          <p className="add-note-error">{error}</p>
        )}

        <div className="add-note-actions">
          <button
            type="submit"
            disabled={submitting || !note.trim()}
            className="add-note-submit-btn"
          >
            <PlusCircle size={16} strokeWidth={2.5} />
            <span>{submitting ? 'Recording...' : 'Log Intervention'}</span>
          </button>
        </div>
      </form>
    </Panel>
  );
}
