import React from 'react';
import { ArrowLeft, Shield, Users, Building, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '../../analytics/components/Panel.jsx';

export function UnitHeaderCard({ unit, force, department, personnelCount, worstCaseRiskLevel }) {
  const navigate = useNavigate();

  const getRiskClass = (level) => {
    switch (level) {
      case 'critical':
        return 'risk-badge-critical';
      case 'high':
        return 'risk-badge-high';
      case 'elevated':
        return 'risk-badge-elevated';
      default:
        return 'risk-badge-normal';
    }
  };

  return (
    <Panel className="personnel-header-panel" padding="p-5">
      <div className="personnel-header-top">
        <button
          type="button"
          onClick={() => navigate('/commanding-officer')}
          className="personnel-back-btn"
        >
          <ArrowLeft size={16} strokeWidth={3} />
          <span>Back to Command Overview</span>
        </button>
      </div>

      <div className="personnel-profile-row">
        <div className="personnel-avatar-badge">
          <Shield size={28} strokeWidth={2.5} />
        </div>

        <div className="personnel-profile-info">
          <div className="personnel-name-row">
            <h1 className="personnel-profile-name">{unit || 'Unit Name'}</h1>
            {worstCaseRiskLevel && (
              <span className={`risk-badge ${getRiskClass(worstCaseRiskLevel)}`}>
                <AlertTriangle size={12} strokeWidth={2.5} />
                {worstCaseRiskLevel.toUpperCase()} RISK
              </span>
            )}
          </div>

          <div className="personnel-meta-grid">
            <span className="personnel-meta-item">
              <Building size={14} className="meta-icon" />
              {force || department || 'Force'}
            </span>
            <span className="personnel-meta-item">
              <Users size={14} className="meta-icon" />
              {personnelCount ?? 0} Personnel
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
