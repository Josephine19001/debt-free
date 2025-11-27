import { Component, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-[#0F0F0F] justify-center items-center p-6">
          <Text className="text-lg font-bold text-red-500 text-center mb-4">
            Something went wrong
          </Text>
          <Text className="text-gray-400 text-center mb-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text className="text-gray-500 text-center text-sm mb-6">
            Please rebuild the app or restart.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="bg-emerald-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
