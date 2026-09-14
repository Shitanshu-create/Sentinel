import React, { useState } from 'react';
import { GraduationCap, Plus, Trash2, Calendar } from 'lucide-react';
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
          <GraduationCap size={20} strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="profile-section-title">Training Commitments & Courses</h2>
          <p className="profile-section-desc">Track specialized courses, tactical drills, and physical qualification commitments</p>
        </div>
      </div>

      <div className="profile-repeater-list">
        {trainingCommitments.length === 0 ? (
          <div className="profile-empty-card">
            <GraduationCap size={24} className="profile-empty-icon" />
            <p className="profile-empty-text">No recorded training commitments. Add active or past courses below.</p>
          </div>
        ) : (
          trainingCommitments.map((item, idx) => (
            <div key={idx} className="profile-repeater-item">
              <div className="profile-repeater-info">
                <strong className="profile-repeater-title">{item.name || 'Training Course'}</strong>
                <span className="profile-repeater-dates">
                  <Calendar size={13} className="inline-icon" />
                  {item.startDate ? item.startDate : 'Start: N/A'} → {item.endDate ? item.endDate : 'Ongoing / Current'}
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
        <div className="profile-repeater-fields-grid">
          <div className="profile-form-group">
            <label className="profile-mini-label">Course / Program Name</label>
            <input
              type="text"
              placeholder="e.g. Counter-Terrorism Tactics / HAWS High Altitude"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              className="profile-input"
              maxLength={150}
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-mini-label">Start Date</label>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => setDraft((p) => ({ ...p, startDate: e.target.value }))}
              className="profile-input"
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-mini-label">End Date (Optional)</label>
            <input
              type="date"
              value={draft.endDate}
              onChange={(e) => setDraft((p) => ({ ...p, endDate: e.target.value }))}
              className="profile-input"
            />
          </div>
          <div className="profile-add-btn-col">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!draft.name.trim()}
              className="profile-add-btn"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Course</span>
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
