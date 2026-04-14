import React from 'react';

/**
 * ErrorBoundary — catches unhandled render errors anywhere in the tree.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * An optional `fallback` prop can override the default error UI.
 *
 * Must be a class component — React has no hook equivalent for
 * componentDidCatch / getDerivedStateFromError.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to a monitoring service (Sentry, etc.)
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Allow caller to supply a custom fallback UI
    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--paper-cream, #f5f0e8)',
        fontFamily: 'var(--font-body, serif)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--ink-black, #1a1008)' }}>
          ⚠️ Something went wrong
        </h1>
        <p style={{ marginBottom: '0.5rem', color: 'var(--ink-brown, #5c3d1e)', maxWidth: '480px' }}>
          An unexpected error occurred. Your saved progress should be safe.
        </p>
        {this.state.error && (
          <pre style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(0,0,0,0.06)',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: 'var(--ink-brown, #5c3d1e)',
            maxWidth: '560px',
            overflowX: 'auto',
            textAlign: 'left'
          }}>
            {this.state.error.message}
          </pre>
        )}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: 'var(--paper-aged, #e8dcc8)',
              border: '2px solid var(--border-dark, #2c1810)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.replace('/')}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: 'var(--paper-aged, #e8dcc8)',
              border: '2px solid var(--border-dark, #2c1810)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            ← Return Home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
