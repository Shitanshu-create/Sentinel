import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Panel } from './Panel.jsx';

export function ObservationsPanel({ insightsRequest, activeObservations, expandedObservation, setExpandedObservation }) {
  return (
    <Panel>
      <div className="obs-header">
        <span className="obs-icon-circle">
          <span className="obs-icon-dot" />
        </span>
        <div>
          <h2 className="obs-title">AI Observations</h2>
          <p className="obs-desc">Patterns distilled from your writing</p>
        </div>
      </div>
      <div className="obs-list">
        {insightsRequest.error && (
          <p className="analytics-empty-state">{insightsRequest.error}</p>
        )}
        {!insightsRequest.error && activeObservations.length === 0 && (
          <p className="analytics-empty-state">No AI observations generated yet.</p>
        )}
        {!insightsRequest.error && activeObservations.map(([label, text]) => {
          const open = expandedObservation === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setExpandedObservation(open ? null : label)}
              className={`obs-btn ${open ? 'obs-btn-open' : ''}`}
            >
              <span className="obs-btn-header">
                <span className="obs-tag">{label}</span>
                <ChevronDown className={`obs-chevron ${open ? 'chevron-rotated' : ''}`} size={16} />
              </span>
              <p className={`obs-text ${open ? 'obs-text-open' : 'obs-text-closed'}`}>"{text}"</p>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
