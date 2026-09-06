import React from 'react';

export function Panel({ children, className = '', padding = 'p-5' }) {
  return (
    <section className={`analytics-panel ${padding} ${className}`}>
      {children}
    </section>
  );
}
