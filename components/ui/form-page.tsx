import { useRef, useEffect, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Switch,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { PageLayout } from '@/components/layouts';
import { useColors } from '@/lib/hooks/use-colors';
import { useTheme } from '@/context/theme-provider';

import type { KeyboardTypeOptions } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
}: FormFieldProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const height = multiline ? 56 * numberOfLines : 56;

  return (
    <View className="gap-2">
      <Text style={{ color: colors.textSecondary }} className="text-sm font-medium ml-1">{label}</Text>
      <View
        className="rounded-2xl overflow-hidden"
        style={{
          height,
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: isDark ? 4 : 6,
          elevation: isDark ? 3 : 2,
        }}
      >
        {isDark && (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          </BlurView>
        )}
        <View className="absolute inset-0 rounded-2xl" style={{ borderWidth: 1, borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)' }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          keyboardAppearance={isDark ? 'dark' : 'light'}
          textAlignVertical={multiline ? 'top' : 'center'}
          className={`flex-1 text-base px-4 ${multiline ? 'py-4' : ''}`}
          style={{ color: editable ? colors.text : colors.textMuted }}
        />
      </View>
    </View>
  );
}

interface ToggleFieldProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleField({
  label,
  description,
  value,
  onValueChange,
}: ToggleFieldProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: isDark ? colors.card : '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: isDark ? 4 : 6,
        elevation: isDark ? 3 : 2,
      }}
    >
      {isDark && (
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' }} />
        </BlurView>
      )}
      <View className="absolute inset-0 rounded-2xl" style={{ borderWidth: 1, borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)' }} />
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-1 mr-4">
          <Text style={{ color: colors.text }} className="text-base">{label}</Text>
          {description && (
            <Text style={{ color: colors.textMuted }} className="text-sm mt-1">{description}</Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: isDark ? '#3f3f46' : '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

function SkeletonField() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View className="gap-2">
      <Animated.View
        style={{ opacity }}
        className="h-4 w-20 rounded bg-white/10 ml-1"
      />
      <Animated.View
        style={{ opacity }}
        className="h-14 rounded-2xl bg-white/[0.05]"
      />
    </View>
  );
}

interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 3 }: FormSkeletonProps) {
  return (
    <View className="gap-5">
      {Array.from({ length: fields }).map((_, i) => (
        <SkeletonField key={i} />
      ))}
    </View>
  );
}

interface FormPageProps {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
  skeletonFields?: number;
  rightAction?: ReactNode;
}

export function FormPage({
  title,
  children,
  isLoading = false,
  skeletonFields = 3,
  rightAction,
}: FormPageProps) {
  return (
    <PageLayout title={title} showBackButton rightAction={rightAction}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <FormSkeleton fields={skeletonFields} />
        ) : (
          <View className="gap-5">{children}</View>
        )}
      </ScrollView>
    </PageLayout>
  );
}

interface SaveButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

export function SaveButton({
  onPress,
  disabled = false,
  loading = false,
  label = 'Save',
}: SaveButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={{ opacity: !disabled && !loading ? 1 : 0.4 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#10B981" />
      ) : (
        <Text className="text-base font-semibold text-emerald-500">{label}</Text>
      )}
    </Pressable>
  );
}
