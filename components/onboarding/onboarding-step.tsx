import { ReactNode } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, { SlideInRight, FadeInUp } from 'react-native-reanimated';
import { useColors } from '@/lib/hooks/use-colors';

interface OnboardingStepProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  withKeyboardAvoid?: boolean;
  footer?: ReactNode;
}

export function OnboardingStep({
  children,
  title,
  subtitle,
  withKeyboardAvoid = false,
  footer,
}: OnboardingStepProps) {
  const colors = useColors();

  const content = (
    <Animated.View entering={SlideInRight.duration(300)} className="flex-1 px-6 justify-between pb-8">
      <View className="flex-1 justify-center">
        <Animated.Text
          entering={FadeInUp.delay(100).duration(500)}
          className="text-3xl font-bold text-center mb-2"
          style={{ color: colors.text }}
        >
          {title}
        </Animated.Text>
        {subtitle && (
          <Animated.Text
            entering={FadeInUp.delay(200).duration(500)}
            className="text-center mb-10"
            style={{ color: colors.textMuted }}
          >
            {subtitle}
          </Animated.Text>
        )}
        {children}
      </View>
      {footer}
    </Animated.View>
  );

  if (withKeyboardAvoid) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}
