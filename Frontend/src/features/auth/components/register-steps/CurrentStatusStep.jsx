import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function CurrentStatusStep({ data, updateData, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label className="auth-label">
        Current Posting Location
        <input
          type="text"
          value={data.postingLocation || ''}
          onChange={(e) => updateData({ postingLocation: e.target.value })}
          placeholder="e.g. Forward Operating Base - Sector 4"
          className="auth-input"
        />
      </label>

      <div className="auth-form-row">
        <label className="auth-label">
          Est. Daily Work Hours (0-24)
          <input
            type="number"
            min={0}
            max={24}
            value={data.estimatedWorkHours ?? ''}
            onChange={(e) => updateData({ estimatedWorkHours: e.target.value })}
            placeholder="12"
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          Last Leave Date
          <input
            type="date"
            value={data.lastLeaveDate || ''}
            onChange={(e) => updateData({ lastLeaveDate: e.target.value })}
            className="auth-input"
          />
        </label>
      </div>

      <label className="auth-label">
        Current Duty Schedule Notes
        <input
          type="text"
          value={data.dutySchedule || ''}
          onChange={(e) => updateData({ dutySchedule: e.target.value })}
          placeholder="e.g. 12h night shift rotation, high alert posture"
          className="auth-input"
        />
      </label>

      <div className="auth-button-group">
        <button type="button" onClick={onBack} className="auth-secondary-btn">
          <ArrowLeft size={16} strokeWidth={3} />
          Back
        </button>
        <button type="submit" className="auth-submit-btn">
          Next: Account
          <ArrowRight size={16} strokeWidth={3} />
        </button>
      </div>
    </form>
  );
}
