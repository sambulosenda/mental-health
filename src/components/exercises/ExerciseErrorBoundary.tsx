import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@/src/components/ui';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ExerciseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Exercise error boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center px-6 bg-background dark:bg-background-dark">
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-error/10 items-center justify-center mb-4">
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
            </View>
            <Text variant="h3" color="textPrimary" center className="mb-2">
              {this.props.fallbackTitle || 'Something went wrong'}
            </Text>
            <Text variant="body" color="textSecondary" center className="mb-6">
              An error occurred while loading the exercise. Please try again.
            </Text>
            <Button onPress={this.handleReset}>
              Try Again
            </Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
