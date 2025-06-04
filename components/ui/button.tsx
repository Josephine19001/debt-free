import { Pressable, View, ActivityIndicator, type PressableProps } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'link' | 'secondary';
  label: string;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  label,
  className,
  style,
  disabled,
  loading = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        'items-center justify-center',
        variant === 'primary' && 'bg-black p-4 rounded-xl mb-4',
        variant === 'link' && 'flex-row',
        variant === 'secondary' && 'border border-slate-300 p-4 rounded-xl mb-4',
        className,
        isDisabled && 'opacity-60'
      )}
      style={({ pressed }) => [
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
        pressed && !isDisabled && { opacity: 0.8 },
      ]}
      {...props}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : 'black'} size="small" />
      ) : (
        <Text
          variant="button"
          className={cn(variant === 'primary' ? 'text-white' : 'text-black', 'font-bold')}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

interface ButtonWithIconProps extends ButtonProps {
  icon: React.ElementType;
}

export function ButtonWithIcon({
  label,
  onPress,
  className = '',
  icon: Icon,
  children,
}: ButtonWithIconProps) {
  return (
    <Pressable onPress={onPress} className={`${className}`}>
      {children || (
        <View
          className={cn(
            'flex-row items-center justify-center px-2 py-1 rounded-xl border border-black'
          )}
        >
          {Icon && <Icon size={20} className="ml-2" />}
          <Text className={cn('text-base font-medium text-black')}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
