import React from 'react';
import { Zap, Check, X } from 'lucide-react';
import { Panel } from './Panel.jsx';

export function AdvicePanel({ insightsRequest, visibleAdvice, doneAdvice, setDoneAdvice, setDismissedAdvice }) {
  return (
    <Panel>
      <div className="advice-header">
        <div>
          <h2 className="obs-title">Productivity Advice</h2>
          <p className="obs-desc">Personalized suggestions based on your data</p>
        </div>
        <span className="advice-tag-badge">AI-generated</span>
      </div>
      <div className="advice-list">
        {insightsRequest.error && (
          <p className="analytics-empty-state">{insightsRequest.error}</p>
        )}
        {!insightsRequest.error && visibleAdvice.length === 0 && (
          <p className="analytics-empty-state">No productivity advice generated yet.</p>
        )}
        {!insightsRequest.error && visibleAdvice.map(([tag, title, text, action]) => {
          const done = doneAdvice.includes(title);
          return (
            <article key={title} className={`advice-card ${done ? 'advice-done' : ''}`}>
              <div className="advice-icon"><Zap size={18} fill="currentColor" /></div>
              <div className="advice-body">
                <div className="advice-card-header">
                  <p className="advice-category-tag">{tag}</p>
                  <span className="advice-actions">
                    <button type="button" onClick={() => setDoneAdvice((current) => done ? current.filter((item) => item !== title) : [...current, title])} className="advice-check-btn">
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={() => setDismissedAdvice((current) => [...current, title])} className="advice-close-btn">
                      <X size={14} />
                    </button>
                  </span>
                </div>
                <h3 className="advice-title">{title}</h3>
                <p className="advice-desc">{text}</p>
                <button type="button" className="advice-action-btn">
                  {action} →
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
