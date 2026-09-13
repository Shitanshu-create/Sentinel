import React from 'react';
import { User } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';

export function PersonalDetailsSection({ data, setData }) {
  const handleChange = (field, val) => {
    setData((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <Panel padding="p-6" className="profile-section-card">
      <div className="profile-section-title-row">
        <span className="profile-section-icon">
          <User size={18} strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="profile-section-title">Personal Details</h2>
          <p className="profile-section-desc">Basic identification and personal contact information</p>
        </div>
      </div>

      <div className="profile-grid-fields">
        <div className="profile-form-group">
          <label className="profile-form-label">Full Name</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="profile-input"
            maxLength={100}
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">Age (Years)</label>
          <input
            type="number"
            min={18}
            max={65}
            value={data.age !== undefined && data.age !== null ? data.age : ''}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="18 - 65"
            className="profile-input"
          />
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">Gender</label>
          <select
            value={data.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="profile-select"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">Phone Number</label>
          <input
            type="tel"
            value={data.phoneNo || ''}
            onChange={(e) => handleChange('phoneNo', e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="profile-input"
            maxLength={15}
          />
        </div>
      </div>
    </Panel>
  );
}
