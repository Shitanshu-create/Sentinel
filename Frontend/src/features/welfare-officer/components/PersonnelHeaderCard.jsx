import React from 'react';
import { ArrowLeft, User, MapPin, Briefcase, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '../../analytics/components/Panel.jsx';

export function PersonnelHeaderCard({ person }) {
  const navigate = useNavigate();

  const name = person.personalDetails?.name || person.username || 'Personnel Profile';
  const rank = person.serviceDetails?.rank || '—';
  const unit = person.serviceDetails?.unit || 'Unassigned Unit';
  const department = person.serviceDetails?.force || person.serviceDetails?.department || 'Operations';
  const posting = person.currentStatus?.postingLocation || 'Active Deployment';
  const duty = person.currentStatus?.dutySchedule || 'Standard Rotation';
  const hours = person.currentStatus?.estimatedWorkHours
    ? `${person.currentStatus.estimatedWorkHours} hrs/shift`
    : null;

  return (
    <Panel className="personnel-header-panel" padding="p-5">
      <div className="personnel-header-top">
        <button
          type="button"
          onClick={() => navigate('/welfare-officer')}
          className="personnel-back-btn"
        >
          <ArrowLeft size={16} strokeWidth={3} />
          <span>Back to Roster</span>
        </button>
      </div>

      <div className="personnel-profile-row">
        <div className="personnel-avatar-badge">
          <User size={28} strokeWidth={2.5} />
        </div>

        <div className="personnel-profile-info">
          <div className="personnel-name-row">
            <h1 className="personnel-profile-name">{name}</h1>
            <span className="personnel-rank-pill">{rank}</span>
          </div>

          <div className="personnel-meta-grid">
            <span className="personnel-meta-item">
              <Briefcase size={14} className="meta-icon" />
              {unit} · {department}
            </span>
            <span className="personnel-meta-item">
              <MapPin size={14} className="meta-icon" />
              {posting}
            </span>
            <span className="personnel-meta-item">
              <Calendar size={14} className="meta-icon" />
              {duty}
            </span>
            {hours && (
              <span className="personnel-meta-item">
                <Clock size={14} className="meta-icon" />
                {hours}
              </span>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
