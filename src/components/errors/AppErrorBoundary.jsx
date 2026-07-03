import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-10 max-w-xl theme-card-lg text-center">
          <h2 className="theme-section-title !text-xl">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-600">
            We hit an unexpected issue while rendering this section.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg theme-btn-primary"
            onClick={this.handleRetry}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
