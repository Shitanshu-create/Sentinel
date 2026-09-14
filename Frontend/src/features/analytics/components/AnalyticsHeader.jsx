import React from 'react';

export function AnalyticsHeader({ statsRequest, insightsRequest }) {
  return (
    <header className="analytics-header">
      <h1 className="analytics-h1">
        <span className="header-dot" />
        Emotional Landscape
      </h1>
      <p className="header-desc">
        Reflecting on your journey through the lens of artificial intelligence. Your thoughts, distilled into patterns.
      </p>
      {(statsRequest.loading || insightsRequest.loading) && (
        <p className="header-desc">Loading latest journal signals...</p>
      )}
      {(statsRequest.error || insightsRequest.error) && (
        <p className="header-desc" style={{ color: 'var(--color-danger-text)' }}>
          {statsRequest.error || insightsRequest.error}
        </p>
      )}
    </header>
  );
}
