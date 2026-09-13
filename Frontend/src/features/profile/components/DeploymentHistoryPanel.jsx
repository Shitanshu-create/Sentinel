import React, { useState } from 'react';
import { Compass, Plus, Trash2, Calendar } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';

export function DeploymentHistoryPanel({ deploymentHistory, setDeploymentHistory }) {
  const [draft, setDraft] = useState({ location: '', startDate: '', endDate: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!draft.location.trim()) return;
    setDeploymentHistory([...deploymentHistory, { ...draft }]);
    setDraft({ location: '', startDate: '', endDate: '' });
  };

  const handleRemove = (index) => {
    setDeploymentHistory(deploymentHistory.filter((_, i) => i !== index));
  };

  return (
    <Panel padding="p-6" className="profile-section-card">
      <div className="profile-section-title-row">
        <span className="profile-section-icon">
          <Compass size={20} strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="profile-section-title">Deployment History</h2>
          <p className="profile-section-desc">Record past operational field deployments, mission postings, and operational windows</p>
        </div>
      </div>

      <div className="profile-repeater-list">
        {deploymentHistory.length === 0 ? (
          <div className="profile-empty-card">
            <Compass size={24} className="profile-empty-icon" />
            <p className="profile-empty-text">No recorded deployments on file. Use the form below to add one.</p>
          </div>
        ) : (
          deploymentHistory.map((item, idx) => (
            <div key={idx} className="profile-repeater-item">
              <div className="profile-repeater-info">
                <strong className="profile-repeater-title">{item.location || 'Unspecified Deployment'}</strong>
                <span className="profile-repeater-dates">
                  <Calendar size={13} className="inline-icon" />
                  {item.startDate ? item.startDate : 'Start: N/A'} → {item.endDate ? item.endDate : 'Ongoing / Current'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="profile-item-delete-btn"
                title="Remove deployment"
                aria-label="Remove deployment"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="profile-repeater-add-box">
        <h3 className="profile-repeater-add-title">Add Deployment Record</h3>
        <div className="profile-repeater-fields-grid">
          <div className="profile-form-group">
            <label className="profile-mini-label">Deployment Location / Mission</label>
            <input
              type="text"
              placeholder="e.g. Siachen Base Camp / Operation Trident"
              value={draft.location}
              onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
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
              disabled={!draft.location.trim()}
              className="profile-add-btn"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Deployment</span>
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
