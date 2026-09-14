import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { FORCES, UNITS, RANKS, JOB_TYPES } from '../../../../shared/utils/serviceOptions.js';

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="auth-label">
      {label}
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="auth-input">
        <option value="">Select {label}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  );
}

export function ServiceSelectionStep({ data = {}, updateData, role = 'personnel', onNext, onBack, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <SelectField label="Force" value={data.force} options={FORCES} onChange={(v) => updateData({ force: v })} />

      {(role === 'personnel' || role === 'welfare_officer') && (
        <SelectField label="Unit" value={data.unit} options={UNITS} onChange={(v) => updateData({ unit: v })} />
      )}

      {role === 'personnel' && (
        <>
          <SelectField label="Rank / Designation" value={data.rank} options={RANKS} onChange={(v) => updateData({ rank: v })} />
          <SelectField label="Job Type" value={data.jobType} options={JOB_TYPES} onChange={(v) => updateData({ jobType: v })} />
        </>
      )}

      <div className="auth-button-group">
        <button type="button" onClick={onBack} disabled={loading} className="auth-secondary-btn">
          <ArrowLeft size={16} strokeWidth={3} />
          Back
        </button>
        <button type="submit" disabled={loading} className="auth-submit-btn">
          {loading ? 'Creating Vault...' : 'Create Account'}
          <ArrowRight size={16} strokeWidth={3} />
        </button>
      </div>
    </form>
  );
}
