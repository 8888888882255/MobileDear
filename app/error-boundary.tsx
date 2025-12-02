import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

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
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Đã xảy ra lỗi</Text>
            <Text style={styles.subtitle}>
              {this.state.error?.message || 'Lỗi không xác định'}
            </Text>
            {Platform.OS !== 'web' && (
              <Text style={styles.description}>
                Vui lòng kiểm tra nhật ký thiết bị để biết thêm chi tiết.
              </Text>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default ErrorBoundary;
