import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';
import { useAddOrgNote } from '../hooks/useAddOrgNote.js';

const ACTION_OPTIONS = [
  { value: 'workload_review', label: 'Workload & Distribution Review' },
  { value: 'staffing_review', label: 'Staffing & Manning Review' },
  { value: 'duty_schedule_review', label: 'Duty Schedule / Shift Adjustment' },
  { value: 'leave_policy_review', label: 'Leave & Rotation Policy Review' },
  { value: 'recognition', label: 'Unit Recognition & Commendation' },
  { value: 'general_note', label: 'General Command Note' }
];

export function AddOrgNoteForm({ unitName, onAdded }) {
  const [note, setNote] = useState('');
  const [actionType, setActionType] = useState('workload_review');

  const { submit, submitting, error } = useAddOrgNote(unitName, () => {
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
        <h2 className="obs-title">Log Organizational Directive / Action</h2>
        <p className="add-note-sub">Recorded directives are visible to commanding officers with force-wide oversight</p>
      </div>

      <form onSubmit={handleSubmit} className="add-note-form">
        <div className="add-note-type-wrapper">
          <label className="add-note-label">Directive Category</label>
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
          <label className="add-note-label">Directive / Action Details</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record systemic findings, staffing reallocations, operational tempo adjustments, or leadership directives..."
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
            <span>{submitting ? 'Recording Directive...' : 'Log Directive'}</span>
          </button>
        </div>
      </form>
    </Panel>
  );
}
