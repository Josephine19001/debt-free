import React from 'react';
import { View } from 'react-native';

interface DropletProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

const Droplet: React.FC<DropletProps> = ({ size = 16, color = '#DC2626', filled = true }) => (
  <View
    style={{
      width: size,
      height: size * 1.3,
      backgroundColor: filled ? color : 'transparent',
      borderRadius: size / 2,
      borderTopLeftRadius: size * 0.1,
      borderTopRightRadius: size * 0.1,
      borderBottomLeftRadius: size / 2,
      borderBottomRightRadius: size / 2,
      borderWidth: filled ? 0 : 1,
      borderColor: color,
      transform: [{ rotate: '45deg' }],
    }}
  />
);

interface FlowIconProps {
  level: 'light' | 'moderate' | 'heavy' | 'spotting';
  size?: number;
}

export const FlowIcon: React.FC<FlowIconProps> = ({ level, size = 20 }) => {
  const getDropletConfig = () => {
    switch (level) {
      case 'spotting':
        return [
          { size: size * 0.4, filled: true },
          { size: size * 0.3, filled: false },
        ];
      case 'light':
        return [
          { size: size * 0.6, filled: true },
          { size: size * 0.4, filled: false },
          { size: size * 0.3, filled: false },
        ];
      case 'moderate':
        return [
          { size: size * 0.8, filled: true },
          { size: size * 0.6, filled: true },
          { size: size * 0.4, filled: false },
        ];
      case 'heavy':
        return [
          { size: size, filled: true },
          { size: size * 0.8, filled: true },
          { size: size * 0.6, filled: true },
        ];
      default:
        return [{ size: size * 0.6, filled: true }];
    }
  };

  const droplets = getDropletConfig();

  return (
    <View className="flex-row items-end justify-center" style={{ gap: 2 }}>
      {droplets.map((droplet, index) => (
        <Droplet
          key={index}
          size={droplet.size}
          color="#DC2626"
          filled={droplet.filled}
        />
      ))}
    </View>
  );
};

export const FlowLevels = {
  spotting: 'Spotting',
  light: 'Light',
  moderate: 'Moderate', 
  heavy: 'Heavy',
} as const;

export type FlowLevel = keyof typeof FlowLevels;