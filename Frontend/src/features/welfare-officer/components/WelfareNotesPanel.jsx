import React from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';

const ACTION_LABELS = {
  confidential_check: 'Confidential Welfare Check',
  workload_review: 'Workload Review',
  leave_review: 'Leave & Rest Review',
  rest_recommendation: 'Rest Period Mandated',
  counseling_referral: 'Counseling Support Referral',
  general_note: 'General Observation'
};

export function WelfareNotesPanel({ notes }) {
  return (
    <Panel className="welfare-notes-panel" padding="p-5">
      <div className="welfare-notes-header">
        <h2 className="obs-title">Welfare Interventions & Action Log</h2>
        <p className="welfare-notes-sub">Confidential record of welfare interventions, checks, and recommendations</p>
      </div>

      <div className="welfare-notes-list">
        {notes && notes.length > 0 ? (
          notes.map((item) => {
            const dateStr = new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={item._id} className="welfare-note-card">
                <div className="welfare-note-top">
                  <span className="welfare-note-tag">
                    <ShieldCheck size={14} />
                    {ACTION_LABELS[item.actionType] || item.actionType}
                  </span>
                  <span className="welfare-note-date">
                    <Clock size={12} />
                    {dateStr}
                  </span>
                </div>
                <p className="welfare-note-text">{item.note}</p>
              </div>
            );
          })
        ) : (
          <div className="welfare-notes-empty">
            <p className="obs-desc">No welfare interventions logged for this personnel yet.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}
