import React, { useState } from 'react';
import { ArrowLeftRight, Plus, Trash2, Calendar, MapPin } from 'lucide-react';
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
          <ArrowLeftRight size={20} strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="profile-section-title">Transfer History & Frequency</h2>
          <p className="profile-section-desc">Track unit movements, re-assignments, and relocation frequency</p>
        </div>
      </div>

      <div className="profile-repeater-list">
        {transferHistory.length === 0 ? (
          <div className="profile-empty-card">
            <ArrowLeftRight size={24} className="profile-empty-icon" />
            <p className="profile-empty-text">No recorded transfers on file. Add past transfers below.</p>
          </div>
        ) : (
          transferHistory.map((item, idx) => (
            <div key={idx} className="profile-repeater-item">
              <div className="profile-repeater-info">
                <strong className="profile-repeater-title">
                  {item.fromUnit || 'Previous Unit'} → {item.toUnit || 'New Unit'}
                </strong>
                <span className="profile-repeater-dates">
                  {item.location && (
                    <span className="profile-date-tag">
                      <MapPin size={12} className="inline-icon" />
                      {item.location}
                    </span>
                  )}
                  <span className="profile-date-tag">
                    <Calendar size={12} className="inline-icon" />
                    {item.transferDate ? item.transferDate : 'Date: N/A'}
                  </span>
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
        <div className="profile-repeater-fields-grid">
          <div className="profile-form-group">
            <label className="profile-mini-label">From Unit</label>
            <input
              type="text"
              placeholder="e.g. 9 Para SF"
              value={draft.fromUnit}
              onChange={(e) => setDraft((p) => ({ ...p, fromUnit: e.target.value }))}
              className="profile-input"
              maxLength={100}
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-mini-label">To Unit</label>
            <input
              type="text"
              placeholder="e.g. Alpha Unit"
              value={draft.toUnit}
              onChange={(e) => setDraft((p) => ({ ...p, toUnit: e.target.value }))}
              className="profile-input"
              maxLength={100}
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-mini-label">Posting Location</label>
            <input
              type="text"
              placeholder="e.g. Srinagar"
              value={draft.location}
              onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
              className="profile-input"
              maxLength={150}
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-mini-label">Transfer Date</label>
            <input
              type="date"
              value={draft.transferDate}
              onChange={(e) => setDraft((p) => ({ ...p, transferDate: e.target.value }))}
              className="profile-input"
            />
          </div>
          <div className="profile-add-btn-col profile-col-span-full">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!draft.toUnit.trim() && !draft.fromUnit.trim()}
              className="profile-add-btn"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Transfer Record</span>
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
