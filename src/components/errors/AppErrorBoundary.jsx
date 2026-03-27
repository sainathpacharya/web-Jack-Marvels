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
        <div className="mx-auto my-10 max-w-xl rounded-xl border border-rose-100 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-600">
            We hit an unexpected issue while rendering this section.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-sky-700 px-4 py-2 text-sm text-white hover:bg-sky-800"
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
