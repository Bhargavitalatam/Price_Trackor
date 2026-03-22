import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass-card p-10 rounded-3xl border-rose-500/20">
            <div className="inline-flex p-4 rounded-full bg-rose-500/10 text-rose-500 mb-6">
              <AlertTriangle size={48} />
            </div>
            <h1 className="text-2xl font-black text-white mb-4">Something went wrong</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              The application encountered an unexpected error. Don't worry, your funds are safe (this is just a tracker!).
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
            >
              <RefreshCcw size={20} />
              Reload Dashboard
            </button>
            {this.state.error && (
              <pre className="mt-8 p-4 bg-slate-900/50 rounded-xl text-xs text-slate-500 text-left overflow-auto max-h-32">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
