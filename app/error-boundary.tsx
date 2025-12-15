import React from 'react';
import { View, Platform } from 'react-native';
import { ErrorScreen } from '@/components/ErrorScreen';
import { AlertTriangle } from 'lucide-react-native';
import colors from '@/constants/colors';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const IFRAME_ID = 'rork-web-preview';

const webTargetOrigins = [
  'http://localhost:3000',
  'https://rorkai.com',
  'https://rork.app',
];

function sendErrorToIframeParent(error: any, errorInfo?: any) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const errorMessage = {
      type: 'ERROR',
      error: {
        message: error?.message || error?.toString() || 'Lỗi không xác định',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      },
      iframeId: IFRAME_ID,
    };

    try {
      window.parent.postMessage(
        errorMessage,
        webTargetOrigins.includes(document.referrer) ? document.referrer : '*'
      );
    } catch (postMessageError) {
      console.error('Không thể gửi lỗi về parent:', postMessageError);
    }
  }
}

// Bắt lỗi toàn cục trên nền web
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      event.preventDefault();
      sendErrorToIframeParent(
        event.error ?? {
          message: event.message ?? 'Lỗi không xác định',
          filename: event.filename ?? 'Không rõ file',
          lineno: event.lineno ?? 'Không rõ dòng',
          colno: event.colno ?? 'Không rõ cột',
        }
      );
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      event.preventDefault();
      sendErrorToIframeParent(event.reason);
    },
    true
  );

  const originalConsoleError = console.error;
  console.error = (...args) => {
    sendErrorToIframeParent(args.join(' '));
    originalConsoleError.apply(console, args);
  };
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    sendErrorToIframeParent(error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }



  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          title="Đã xảy ra lỗi"
          message={this.state.error?.message || 'Lỗi không xác định'}
          icon={<AlertTriangle size={64} color={colors.error || '#ef4444'} />}
          actionButtonText="Thử lại"
          onAction={() => this.setState({ hasError: false, error: null })}
          showHomeButton={true}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
