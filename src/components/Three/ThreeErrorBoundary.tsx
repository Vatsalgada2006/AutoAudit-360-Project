import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ThreeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ThreeJS WebGL context unavailable or error caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-6 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-400 text-xs font-mono">
          <span>3D WebGL acceleration fallback active (2D mode enabled).</span>
        </div>
      );
    }
    return this.props.children;
  }
}
