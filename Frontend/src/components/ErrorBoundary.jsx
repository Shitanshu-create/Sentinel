import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-page-container">
          <div className="auth-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 className="auth-title">Something went wrong</h1>
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
