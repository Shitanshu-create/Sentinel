import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AUTH_RULES } from '../../utils/authValidation.js';

export function LoginCredentialsStep({ data, updateData, role = 'personnel', setRole, onSubmit, onBack, loading }) {
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="auth-password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            value={data.password || ''}
            onChange={(e) => updateData({ password: e.target.value })}
            required
            minLength={8}
            maxLength={128}
            placeholder="********"
            className="auth-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="auth-password-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
          </button>
        </div>
        <span className="auth-hint">{AUTH_RULES.password}</span>
      </label>

      <div className="auth-button-group">
        <button type="button" onClick={onBack} disabled={loading} className="auth-secondary-btn">
          <ArrowLeft size={16} strokeWidth={3} />
          Back
        </button>
        <button type="submit" disabled={loading} className="auth-submit-btn">
          Next: Service Details
          <ArrowRight size={16} strokeWidth={3} />
        </button>
      </div>
    </form>
  );
}
