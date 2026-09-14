import React from 'react';
import { Smile, Moon, Zap, ShieldAlert } from 'lucide-react';
import { Panel } from './Panel.jsx';
import { RadialScore } from './RadialScore.jsx';

const ICONS = {
  Smile,
  Moon,
  Zap,
  ShieldAlert
};

export function WellnessOverviewPanel({ overview }) {
  if (!overview) return null;

  return (
    <Panel className="wellness-overview-panel" padding="p-5">
      <div className="wellness-overview-header">
        <div>
          <div className="wellness-overview-title-row">
            <h2 className="obs-title">Wellness Overview</h2>
            <span
              className="wellness-overview-status-badge"
              style={{
                color: overview.statusColor,
                borderColor: overview.statusColor,
                backgroundColor: `color-mix(in srgb, ${overview.statusColor} 12%, transparent)`
              }}
            >
              {overview.statusLabel}
            </span>
          </div>
          <p className="wellness-overview-summary">{overview.summary}</p>
        </div>
      </div>

      <div className="wellness-overview-body">
        <div className="wellness-overview-tiles">
          {overview.tiles.map((tile) => {
            const IconComponent = ICONS[tile.iconName] || Smile;
            return (
              <div key={tile.id} className="wellness-overview-tile">
                <div className="wellness-overview-tile-top">
                  <span className="wellness-overview-tile-icon" style={{ color: tile.color }}>
                    <IconComponent size={18} />
                  </span>
                  <span className={`wellness-overview-tile-delta ${tile.deltaPositive ? 'delta-up' : 'delta-down'}`}>
                    {tile.delta}
                  </span>
                </div>
                <p className="wellness-overview-tile-label">{tile.label}</p>
                <p className="wellness-overview-tile-value">{tile.value}</p>
              </div>
            );
          })}
        </div>

        <div className="wellness-overview-ring">
          <RadialScore
            value={overview.overallScore}
            color={overview.statusColor || 'var(--color-success)'}
            label="Overall Wellness Score"
            large
          />
        </div>
      </div>
    </Panel>
  );
}
