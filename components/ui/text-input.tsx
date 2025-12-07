import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';

interface Props extends TextInputProps {
  className?: string;
}

export function TextInput({ className, multiline, ...props }: Props) {
  const colors = useThemedColors();
  const { isDark } = useTheme();

  return (
    <RNTextInput
      className={cn(
        'rounded-2xl text-base',
        multiline ? 'min-h-20 px-4 py-3' : 'h-12 px-4',
        className
      )}
      placeholderTextColor={colors.gray[400]}
      keyboardAppearance={isDark ? 'dark' : 'light'}
      style={{
        borderWidth: 1,
        borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)',
        backgroundColor: isDark ? colors.background : '#FFFFFF',
        color: colors.foreground,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.04,
        shadowRadius: isDark ? 3 : 4,
        elevation: isDark ? 2 : 1,
      }}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      {...props}
    />
  );
}
