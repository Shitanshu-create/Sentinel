import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { AUTH_RULES } from '../../utils/authValidation.js';

export function LoginCredentialsStep({ data, updateData, role = 'personnel', setRole, onSubmit, onBack, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-role-select">
        <label className="auth-label">Account Type</label>
        <div className="auth-role-options">
          <button
            type="button"
            className={`auth-role-btn ${role === 'personnel' ? 'auth-role-btn-active' : ''}`}
            onClick={() => setRole?.('personnel')}
          >
            Personnel
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === 'welfare_officer' ? 'auth-role-btn-active' : ''}`}
            onClick={() => setRole?.('welfare_officer')}
          >
            Welfare Officer
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === 'commander' ? 'auth-role-btn-active' : ''}`}
            onClick={() => setRole?.('commander')}
          >
            Commanding Officer
          </button>
        </div>
      </div>
      <label className="auth-label">
        Choose Username *
        <input
          type="text"
          value={data.username || ''}
          onChange={(e) => updateData({ username: e.target.value })}
          required
          minLength={2}
          maxLength={60}
          placeholder="e.g. rajesh_kumar"
          className="auth-input"
        />
        <span className="auth-hint">{AUTH_RULES.username}</span>
      </label>

      <label className="auth-label">
        Secure Password *
        <input
          type="password"
          value={data.password || ''}
          onChange={(e) => updateData({ password: e.target.value })}
          required
          minLength={8}
          maxLength={128}
          placeholder="********"
          className="auth-input"
        />
        <span className="auth-hint">{AUTH_RULES.password}</span>
      </label>

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
