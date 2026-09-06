import { Component, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { captureError } from '@/lib/sentry';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureError(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--error-soft)' }}>
            <X size={28} style={{ color: 'var(--error)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="mt-2 max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
              An unexpected error occurred. The issue has been reported automatically.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
