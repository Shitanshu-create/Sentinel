import React from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';

const ACTION_LABELS = {
  workload_review: 'Workload & Distribution Review',
  staffing_review: 'Staffing & Manning Review',
  duty_schedule_review: 'Duty Schedule / Shift Adjustment',
  leave_policy_review: 'Leave & Rotation Policy Review',
  recognition: 'Unit Recognition & Commendation',
  general_note: 'General Command Note'
};

export function OrganizationalNotesPanel({ notes }) {
  return (
    <Panel className="welfare-notes-panel" padding="p-5">
      <div className="welfare-notes-header">
        <h2 className="obs-title">Organizational Directives & Action Log</h2>
        <p className="welfare-notes-sub">Confidential log of unit-level leadership reviews, staffing actions, and duty directives</p>
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
            <p className="obs-desc">No organizational directives or notes logged for this unit yet.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}
