import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function ServiceDetailsStep({ data, updateData, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form-row">
        <label className="auth-label">
          Rank / Designation
          <input
            type="text"
            value={data.rank || ''}
            onChange={(e) => updateData({ rank: e.target.value })}
            placeholder="e.g. Sub-Inspector / Constable"
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          Job Role / Duty Type
          <input
            type="text"
            value={data.role || ''}
            onChange={(e) => updateData({ role: e.target.value })}
            placeholder="e.g. Field Operative / Logistics"
            className="auth-input"
          />
        </label>
      </div>

      <div className="auth-form-row">
        <label className="auth-label">
          Unit / Battalion
          <input
            type="text"
            value={data.unit || ''}
            onChange={(e) => updateData({ unit: e.target.value })}
            placeholder="e.g. 102 BN CRPF"
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          Department / Force Branch
          <input
            type="text"
            value={data.department || ''}
            onChange={(e) => updateData({ department: e.target.value })}
            placeholder="e.g. Operational Division"
            className="auth-input"
          />
        </label>
      </div>

      <div className="auth-button-group">
        <button type="button" onClick={onBack} className="auth-secondary-btn">
          <ArrowLeft size={16} strokeWidth={3} />
          Back
        </button>
        <button type="submit" className="auth-submit-btn">
          Next: Status
          <ArrowRight size={16} strokeWidth={3} />
        </button>
      </div>
    </form>
  );
}
