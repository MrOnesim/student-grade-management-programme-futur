import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Une erreur est survenue</h1>
          <p className="text-gray-500 mb-6">
            Quelque chose s'est mal passé. L'équipe technique a été informée.
          </p>
          {this.state.error && (
            <pre className="text-xs text-left bg-gray-100 p-4 rounded-lg mb-6 overflow-auto max-h-32 text-red-600">
              {this.state.error.message}
            </pre>
          )}
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm">
            <RefreshCw size={16} /> Recharger la page
          </button>
        </div>
      </div>
    );
  }
}
