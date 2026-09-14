import React from 'react';
import { Panel } from './Panel.jsx';
import { RadialScore } from './RadialScore.jsx';

export function WellnessScorePanel({ overallWellnessScore, computedWellnessScores }) {
  return (
    <Panel className="mt-4">
      <div className="wellness-header">
        <div>
          <h2 className="obs-title">Mental Wellness Score</h2>
          <p className="obs-desc">Derived from your writing patterns</p>
        </div>
        <div className="wellness-score-badge">
          <p className="wellness-score-value">{overallWellnessScore}</p>
          <p className="wellness-score-label">Overall</p>
        </div>
      </div>
      <div className="wellness-scores-grid">
        {computedWellnessScores.map((score) => <RadialScore key={score.label} {...score} />)}
      </div>
      <p className="wellness-footer">
        These scores reflect journaling patterns only, not clinical assessments.
      </p>
    </Panel>
  );
}
