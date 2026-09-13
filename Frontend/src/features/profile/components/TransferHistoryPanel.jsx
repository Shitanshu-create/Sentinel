import React, { useState } from 'react';
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';

export function TransferHistoryPanel({ transferHistory, setTransferHistory }) {
  const [draft, setDraft] = useState({ fromUnit: '', toUnit: '', location: '', transferDate: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!draft.toUnit.trim() && !draft.fromUnit.trim() && !draft.location.trim()) return;
    setTransferHistory([...transferHistory, { ...draft }]);
    setDraft({ fromUnit: '', toUnit: '', location: '', transferDate: '' });
  };

  const handleRemove = (index) => {
    setTransferHistory(transferHistory.filter((_, i) => i !== index));
  };

  return (
    <Panel padding="p-6" className="profile-section-card">
      <div className="profile-section-title-row">
        <span className="profile-section-icon">
          <ArrowLeftRight size={18} strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="profile-section-title">Transfer History & Frequency</h2>
          <p className="profile-section-desc">Track unit movements, re-assignments, and relocation frequency</p>
        </div>
      </div>

      <div className="profile-repeater-list">
        {transferHistory.length === 0 ? (
          <p className="profile-empty-text">No recorded transfers on file. Add past transfers below.</p>
        ) : (
          transferHistory.map((item, idx) => (
            <div key={idx} className="profile-repeater-item">
              <div className="profile-repeater-info">
                <strong className="profile-repeater-title">
                  {item.fromUnit || 'Previous Unit'} → {item.toUnit || 'New Unit'}
                </strong>
                <span className="profile-repeater-dates">
                  {item.location ? `Location: ${item.location} • ` : ''}
                  {item.transferDate ? `Date: ${item.transferDate}` : 'Date: N/A'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="profile-item-delete-btn"
                title="Remove transfer"
                aria-label="Remove transfer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="profile-repeater-add-box">
        <h3 className="profile-repeater-add-title">Add Transfer Record</h3>
        <div className="profile-repeater-grid">
          <input
            type="text"
            placeholder="From Unit"
            value={draft.fromUnit}
            onChange={(e) => setDraft((p) => ({ ...p, fromUnit: e.target.value }))}
            className="profile-input"
            maxLength={100}
          />
          <input
            type="text"
            placeholder="To Unit"
            value={draft.toUnit}
            onChange={(e) => setDraft((p) => ({ ...p, toUnit: e.target.value }))}
            className="profile-input"
            maxLength={100}
          />
          <input
            type="text"
            placeholder="Posting Location"
            value={draft.location}
            onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
            className="profile-input"
            maxLength={150}
          />
          <input
            type="date"
            placeholder="Transfer Date"
            value={draft.transferDate}
            onChange={(e) => setDraft((p) => ({ ...p, transferDate: e.target.value }))}
            className="profile-input"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!draft.toUnit.trim() && !draft.fromUnit.trim()}
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
