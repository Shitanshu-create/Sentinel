import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Panel } from './Panel.jsx';

export function WellnessRiskPanel({ riskMeta }) {
  return (
    <Panel padding="p-5" className="wellness-risk-panel">
      <div className="obs-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="obs-icon-circle" style={{ backgroundColor: 'color-mix(in srgb, ' + riskMeta.color + ' 15%, transparent)' }}>
            <ShieldAlert size={18} strokeWidth={2.5} style={{ color: riskMeta.color }} />
          </span>
          <div>
            <h2 className="obs-title">{riskMeta.title}</h2>
            <p className="obs-desc" style={{ margin: '0.25rem 0 0 0' }}>Longitudinal personnel welfare assessment</p>
          </div>
        </div>
      </div>

      <div 
        style={{ 
          marginTop: '1rem', 
          padding: '0.875rem 1rem', 
          borderRadius: '0.75rem', 
          border: '1px solid var(--color-border)', 
          backgroundColor: 'var(--color-surface-hover)',
          borderLeft: `4px solid ${riskMeta.color}`
        }}
      >
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text)', lineHeight: 1.5, fontWeight: 500 }}>
          {riskMeta.desc}
        </p>
      </div>
    </Panel>
  );
}
