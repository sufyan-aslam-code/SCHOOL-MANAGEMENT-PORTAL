import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Something went wrong</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                An unexpected error occurred in the application. Please refresh the page or contact the portal administrator if the issue persists.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="text-left bg-slate-900 text-red-300 p-3.5 rounded-xl text-xs overflow-auto max-h-40 font-mono shadow-inner">
                {this.state.error.toString()}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all w-full cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;