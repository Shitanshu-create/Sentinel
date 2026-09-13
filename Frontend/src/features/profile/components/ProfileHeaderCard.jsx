import React from 'react';
import { Shield, UserCircle, Mail, Award, MapPin } from 'lucide-react';
import { Panel } from '../../analytics/components/Panel.jsx';

export function ProfileHeaderCard({ user }) {
  const name = user?.personalDetails?.name || user?.username || 'Personnel';
  const role = user?.role || 'personnel';
  const rank = user?.serviceDetails?.rank || 'Unassigned Rank';
  const unit = user?.serviceDetails?.unit || 'Unassigned Unit';
  const force = user?.serviceDetails?.force || 'Defence Force';
  const posting = user?.currentStatus?.postingLocation || 'General Posting';

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'P';

  return (
    <Panel padding="p-6" className="profile-header-card">
      <div className="profile-header-flex">
        <div className="profile-avatar-box">
          <span className="profile-avatar-initials">{initials}</span>
        </div>

        <div className="profile-header-info">
          <div className="profile-title-row">
            <h1 className="profile-user-name">{name}</h1>
            <span className="profile-role-badge">
              <Shield size={14} className="flex-shrink-0" />
              {role.toUpperCase()}
            </span>
          </div>

          <div className="profile-meta-tags">
            <span className="profile-meta-item">
              <Award size={15} />
              {rank} • {unit}
            </span>
            <span className="profile-meta-item">
              <Shield size={15} />
              {force}
            </span>
            <span className="profile-meta-item">
              <MapPin size={15} />
              {posting}
            </span>
            <span className="profile-meta-item">
              <Mail size={15} />
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
