import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

interface Props extends TextInputProps {
  className?: string;
}

export function TextInput({ className, multiline, ...props }: Props) {
  return (
    <RNTextInput
      className={cn(
        'border border-black rounded-2xl text-base text-gray-900',
        multiline ? 'min-h-20 px-4 py-3' : 'h-12 px-4',
        className
      )}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      {...props}
    />
  );
}
