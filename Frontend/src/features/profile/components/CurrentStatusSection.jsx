import React from 'react';
import { Activity, Clock, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';

export function CurrentStatusSection({ data, setData }) {
  const handleChange = (field, val) => {
    setData((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <Panel padding="p-6" className="profile-section-card">
      <div className="profile-section-title-row">
        <span className="profile-section-icon">
          <Activity size={18} strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="profile-section-title">Current Operational Status & Workload</h2>
          <p className="profile-section-desc">Active posting, duty schedule, leave tracking, and self-reported workload</p>
        </div>
      </div>

      <div className="profile-grid-fields">
        <div className="profile-form-group">
          <label className="profile-form-label">
            <MapPin size={14} className="inline mr-1" />
            Current Posting Location
          </label>
          <input
            type="text"
            value={data.postingLocation || ''}
            onChange={(e) => handleChange('postingLocation', e.target.value)}
            placeholder="e.g. Forward Post Bravo, Leh"
            className="profile-input"
            maxLength={150}
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            <Clock size={14} className="inline mr-1" />
            Daily Duty Hours (Est.)
          </label>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={data.estimatedWorkHours !== undefined && data.estimatedWorkHours !== null ? data.estimatedWorkHours : ''}
            onChange={(e) => handleChange('estimatedWorkHours', e.target.value)}
            placeholder="0 - 24 hrs"
            className="profile-input"
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            <Calendar size={14} className="inline mr-1" />
            Last Leave Date
          </label>
          <input
            type="date"
            value={data.lastLeaveDate || ''}
            onChange={(e) => handleChange('lastLeaveDate', e.target.value)}
            className="profile-input"
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            <Clock size={14} className="inline mr-1" />
            Duty Schedule / Shift Pattern
          </label>
          <input
            type="text"
            value={data.dutySchedule || ''}
            onChange={(e) => handleChange('dutySchedule', e.target.value)}
            placeholder="e.g. 12h Rotational Night Watch"
            className="profile-input"
            maxLength={200}
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            <AlertTriangle size={14} className="inline mr-1" />
            Self-Reported Workload Level
          </label>
          <select
            value={data.workloadLevel || ''}
            onChange={(e) => handleChange('workloadLevel', e.target.value)}
            className="profile-select"
          >
            <option value="">Select Workload Level</option>
            <option value="light">Light (Low pressure, steady pace)</option>
            <option value="moderate">Moderate (Manageable routine operational load)</option>
            <option value="heavy">Heavy (High tempo, extended duty)</option>
            <option value="overloaded">Overloaded (Severe fatigue, urgent rest needed)</option>
          </select>
        </div>

        <div className="profile-form-group profile-col-span-full">
          <label className="profile-form-label">Workload & Operational Notes</label>
          <textarea
            value={data.workloadNotes || ''}
            onChange={(e) => handleChange('workloadNotes', e.target.value)}
            placeholder="Any additional context regarding current responsibilities, operational tempo, or fatigue factors..."
            className="profile-textarea"
            rows={3}
            maxLength={300}
          />
          <span className="profile-char-count">{300 - (data.workloadNotes?.length || 0)} chars remaining</span>
        </div>
      </div>
    </Panel>
  );
}
