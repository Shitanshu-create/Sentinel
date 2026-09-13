import React, { useState } from 'react';
import { Compass, Plus, Trash2 } from 'lucide-react';
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
          <Compass size={18} strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="profile-section-title">Deployment History</h2>
          <p className="profile-section-desc">Record past operational field deployments, mission postings, and dates</p>
        </div>
      </div>

      <div className="profile-repeater-list">
        {deploymentHistory.length === 0 ? (
          <p className="profile-empty-text">No recorded deployments. Use the form below to add one.</p>
        ) : (
          deploymentHistory.map((item, idx) => (
            <div key={idx} className="profile-repeater-item">
              <div className="profile-repeater-info">
                <strong className="profile-repeater-title">{item.location || 'Unspecified Location'}</strong>
                <span className="profile-repeater-dates">
                  {item.startDate ? item.startDate : 'Start: N/A'} → {item.endDate ? item.endDate : 'Ongoing / N/A'}
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
        <h3 className="profile-repeater-add-title">Add Deployment</h3>
        <div className="profile-repeater-grid">
          <input
            type="text"
            placeholder="Deployment Location / Mission"
            value={draft.location}
            onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
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
            disabled={!draft.location.trim()}
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
