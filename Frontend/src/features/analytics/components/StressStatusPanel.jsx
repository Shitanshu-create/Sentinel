import React from 'react';
import { Activity } from 'lucide-react';
import { Panel } from './Panel.jsx';

export function StressStatusPanel({ currentStress, stressCategory }) {
  return (
    <Panel padding="p-5">
      <div className="obs-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="obs-icon-circle" style={{ backgroundColor: 'color-mix(in srgb, var(--color-danger) 15%, transparent)' }}>
            <Activity size={18} strokeWidth={2.5} style={{ color: stressCategory.color }} />
          </span>
          <div>
            <h2 className="obs-title">Stress Status</h2>
            <p className="obs-desc" style={{ margin: '0.25rem 0 0 0' }}>Occupational & mental pressure index</p>
          </div>
        </div>
        <span 
          className="obs-tag"
          style={{ 
            backgroundColor: 'color-mix(in srgb, ' + stressCategory.color + ' 15%, transparent)', 
            color: stressCategory.color, 
            borderColor: stressCategory.color 
          }}
        >
          {stressCategory.badge}
        </span>
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ minWidth: '4.5rem' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: 'var(--color-text-strong)' }}>
            {currentStress}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>/100</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: stressCategory.color }}>
              {stressCategory.label}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {currentStress < 45 ? 'Optimal' : currentStress < 70 ? 'Watch' : 'High Alert'}
            </span>
          </div>

          <div 
            style={{ 
              height: '10px', 
              borderRadius: '9999px', 
              background: 'var(--color-surface-hover)', 
              overflow: 'hidden',
              border: '1px solid var(--color-border)'
            }}
          >
            <div 
              style={{ 
                width: `${Math.min(100, Math.max(0, currentStress))}%`, 
                height: '100%', 
                backgroundColor: stressCategory.color,
                borderRadius: '9999px',
                transition: 'width 400ms ease'
              }} 
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}
