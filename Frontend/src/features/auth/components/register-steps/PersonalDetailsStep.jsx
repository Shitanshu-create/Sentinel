import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AUTH_RULES } from '../../utils/authValidation.js';

export function PersonalDetailsStep({ data, updateData, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label className="auth-label">
        Full Name *
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => updateData({ name: e.target.value })}
          required
          minLength={2}
          maxLength={100}
          placeholder="e.g. Inspector Rajesh Kumar"
          className="auth-input"
        />
        <span className="auth-hint">{AUTH_RULES.name}</span>
      </label>

      <label className="auth-label">
        Official Email Address *
        <input
          type="email"
          value={data.email || ''}
          onChange={(e) => updateData({ email: e.target.value })}
          required
          maxLength={254}
          placeholder="rajesh.kumar@crpf.gov.in"
          className="auth-input"
        />
        <span className="auth-hint">{AUTH_RULES.email}</span>
      </label>

      <div className="auth-form-row">
        <label className="auth-label">
          Age
          <input
            type="number"
            value={data.age ?? ''}
            onChange={(e) => updateData({ age: e.target.value })}
            min={18}
            max={65}
            placeholder="32"
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          Gender
          <select
            value={data.gender || 'prefer_not_to_say'}
            onChange={(e) => updateData({ gender: e.target.value })}
            className="auth-input"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
      </div>

      <label className="auth-label">
        Contact Phone No
        <input
          type="tel"
          value={data.phoneNo || ''}
          onChange={(e) => updateData({ phoneNo: e.target.value })}
          placeholder="+91 9876543210"
          className="auth-input"
        />
      </label>

      <div className="auth-button-group">
        <button type="submit" className="auth-submit-btn">
          Next: Service
          <ArrowRight size={16} strokeWidth={3} />
        </button>
      </div>
    </form>
  );
}
