import React from 'react';
import { Search, X } from 'lucide-react';
import './sidepanel.css';

function SidePanel({ open, entries, onSelectEntry, onClose }) {
  return (
    <aside
      className={`side-panel sidepanel-aside ${open ? 'sidepanel-open' : 'sidepanel-closed'}`}
    >
      <div className="sidepanel-content">
        <div className="sidepanel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 className="sidepanel-title">Past Entries</h2>
            <span className="sidepanel-badge">
              {entries.length}
            </span>
          </div>
          <button 
            className="sidepanel-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="sidepanel-list">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                onSelectEntry?.(entry);
                if (window.innerWidth < 500) {
                  onClose?.();
                }
              }}
              className="sidepanel-item"
            >
              <span className="sidepanel-item-date">{entry.date}</span>
              <span className="sidepanel-item-title">{entry.title}</span>
              <span className="sidepanel-item-preview">
                {entry.preview}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default SidePanel;
