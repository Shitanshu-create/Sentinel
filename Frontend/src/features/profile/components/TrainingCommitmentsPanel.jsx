import React, { useState } from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';

export function TrainingCommitmentsPanel({ trainingCommitments, setTrainingCommitments }) {
  const [draft, setDraft] = useState({ name: '', startDate: '', endDate: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setTrainingCommitments([...trainingCommitments, { ...draft }]);
    setDraft({ name: '', startDate: '', endDate: '' });
  };

  const handleRemove = (index) => {
    setTrainingCommitments(trainingCommitments.filter((_, i) => i !== index));
  };

  return (
    <Panel padding="p-6" className="profile-section-card">
      <div className="profile-section-title-row">
        <span className="profile-section-icon">
          <GraduationCap size={18} strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="profile-section-title">Training Commitments & Courses</h2>
          <p className="profile-section-desc">Track specialized courses, tactical drills, and physical qualification commitments</p>
        </div>
      </div>

      <div className="profile-repeater-list">
        {trainingCommitments.length === 0 ? (
          <p className="profile-empty-text">No recorded training commitments. Add active or past courses below.</p>
        ) : (
          trainingCommitments.map((item, idx) => (
            <div key={idx} className="profile-repeater-item">
              <div className="profile-repeater-info">
                <strong className="profile-repeater-title">{item.name || 'Training Course'}</strong>
                <span className="profile-repeater-dates">
                  {item.startDate ? item.startDate : 'Start: N/A'} → {item.endDate ? item.endDate : 'Ongoing / N/A'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="profile-item-delete-btn"
                title="Remove course"
                aria-label="Remove course"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="profile-repeater-add-box">
        <h3 className="profile-repeater-add-title">Add Training Commitment</h3>
        <div className="profile-repeater-grid">
          <input
            type="text"
            placeholder="Course / Training Program Name"
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
            className="profile-input"
            maxLength={150}
          />
          <input
            type="date"
            placeholder="Start Date"
            value={draft.startDate}
            onChange={(e) => setDraft((p) => ({ ...p, startDate: e.target.value }))}
            className="profile-input"
          />
          <input
            type="date"
            placeholder="End Date"
            value={draft.endDate}
            onChange={(e) => setDraft((p) => ({ ...p, endDate: e.target.value }))}
            className="profile-input"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!draft.name.trim()}
            className="profile-add-btn"
          >
            <Plus size={16} strokeWidth={3} />
            Add
          </button>
        </div>
      </div>
    </Panel>
  );
}
