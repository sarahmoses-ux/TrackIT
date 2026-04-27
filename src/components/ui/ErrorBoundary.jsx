import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("TrackIt UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface px-4">
          <div className="max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-danger">
              Unexpected error
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-text">
              TrackIt hit a snag.
            </h1>
            <p className="mt-3 text-base text-muted">
              Refresh the page to try again. If the issue persists, reopen the app and continue
              from the last saved state.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
