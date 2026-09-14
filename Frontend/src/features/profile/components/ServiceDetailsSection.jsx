import React from 'react';
import { Award, Shield, Users, Briefcase } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';
import { FORCES, UNITS, RANKS, JOB_TYPES } from '../../../shared/utils/serviceOptions.js';

export function ServiceDetailsSection({ data, setData }) {
  const handleChange = (field, val) => {
    setData((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <Panel padding="p-6" className="profile-section-card">
      <div className="profile-section-title-row">
        <span className="profile-section-icon">
          <Award size={20} strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="profile-section-title">Service & Operational Details</h2>
          <p className="profile-section-desc">Force branch, rank hierarchy, and unit assignment</p>
        </div>
      </div>

      <div className="profile-grid-fields">
        <div className="profile-form-group">
          <label className="profile-form-label">
            <span className="profile-label-icon"><Shield size={14} /></span>
            Armed Force / Service Branch
          </label>
          <select
            value={data.force || ''}
            onChange={(e) => handleChange('force', e.target.value)}
            className="profile-select"
          >
            <option value="">Select Force</option>
            {FORCES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            <span className="profile-label-icon"><Users size={14} /></span>
            Unit Assignment
          </label>
          <select
            value={data.unit || ''}
            onChange={(e) => handleChange('unit', e.target.value)}
            className="profile-select"
          >
            <option value="">Select Unit</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            <span className="profile-label-icon"><Award size={14} /></span>
            Designated Rank
          </label>
          <select
            value={data.rank || ''}
            onChange={(e) => handleChange('rank', e.target.value)}
            className="profile-select"
          >
            <option value="">Select Rank</option>
            {RANKS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">
            <span className="profile-label-icon"><Briefcase size={14} /></span>
            Operational Role / Job Type
          </label>
          <select
            value={data.jobType || ''}
            onChange={(e) => handleChange('jobType', e.target.value)}
            className="profile-select"
          >
            <option value="">Select Role</option>
            {JOB_TYPES.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>
      </div>
    </Panel>
  );
}
