/**
 * Utility functions for circular progress calculations
 */

export interface CircularProgressProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export interface CircularProgressStyles {
  backgroundCircle: {
    width: number;
    height: number;
    borderWidth: number;
    borderColor: string;
  };
  progressCircle: {
    width: number;
    height: number;
    borderWidth: number;
    borderColor: string;
    borderTopColor?: string;
    borderRightColor?: string;
    borderBottomColor?: string;
    borderLeftColor?: string;
    transform: { rotate: string }[];
  } | null;
  fullCircle: {
    width: number;
    height: number;
    borderWidth: number;
    borderColor: string;
  } | null;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return (consumed / target) * 100;
}

/**
 * Generate circular progress styles using border segments
 * This approach uses 4 border segments to create smooth circular progress
 */
export function getCircularProgressStyles(
  consumed: number,
  target: number,
  color: string,
  size: number = 76,
  strokeWidth: number = 6
): CircularProgressStyles {
  const progress = calculateProgress(consumed, target);

  const baseCircle = {
    width: size,
    height: size,
    borderWidth: strokeWidth,
  };

  // Background circle (always visible)
  const backgroundCircle = {
    ...baseCircle,
    borderColor: '#E5E7EB',
  };

  // If no progress, return just background
  if (progress <= 0) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: null,
    };
  }

  // If 100% or more, show full circle
  if (progress >= 100) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: {
        ...baseCircle,
        borderColor: color,
      },
    };
  }

  // For partial progress, use border segments
  const progressCircle = {
    ...baseCircle,
    borderColor: 'transparent',
    borderTopColor: progress > 0 ? color : 'transparent',
    borderRightColor: progress > 25 ? color : 'transparent',
    borderBottomColor: progress > 50 ? color : 'transparent',
    borderLeftColor: progress > 75 ? color : 'transparent',
    transform: [{ rotate: `${-90 + (progress % 25) * 14.4}deg` }],
  };

  return {
    backgroundCircle,
    progressCircle,
    fullCircle: null,
  };
}

/**
 * Alternative approach using stroke-dasharray concept
 * This creates a more accurate circular progress
 */
export function getAccurateCircularProgressStyles(
  consumed: number,
  target: number,
  color: string,
  size: number = 76,
  strokeWidth: number = 6
): CircularProgressStyles {
  const progress = calculateProgress(consumed, target);

  const baseCircle = {
    width: size,
    height: size,
    borderWidth: strokeWidth,
  };

  // Background circle
  const backgroundCircle = {
    ...baseCircle,
    borderColor: '#E5E7EB',
  };

  if (progress <= 0) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: null,
    };
  }

  if (progress >= 100) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: {
        ...baseCircle,
        borderColor: color,
      },
    };
  }

  // Create segments based on progress percentage
  const segments = Math.min(4, Math.ceil(progress / 25));
  const lastSegmentProgress = progress % 25;

  const progressCircle = {
    ...baseCircle,
    borderColor: 'transparent',
    borderTopColor: segments >= 1 ? color : 'transparent',
    borderRightColor: segments >= 2 ? color : 'transparent',
    borderBottomColor: segments >= 3 ? color : 'transparent',
    borderLeftColor: segments >= 4 ? color : 'transparent',
    transform: [{ rotate: `${-90 + lastSegmentProgress * 14.4}deg` }],
  };

  return {
    backgroundCircle,
    progressCircle,
    fullCircle: null,
  };
}

/**
 * Simple approach - just use rotation for the entire border
 */
export function getSimpleCircularProgressStyles(
  consumed: number,
  target: number,
  color: string,
  size: number = 76,
  strokeWidth: number = 6
): CircularProgressStyles {
  const progress = calculateProgress(consumed, target);

  const baseCircle = {
    width: size,
    height: size,
    borderWidth: strokeWidth,
  };

  const backgroundCircle = {
    ...baseCircle,
    borderColor: '#E5E7EB',
  };

  if (progress <= 0) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: null,
    };
  }

  if (progress >= 100) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: {
        ...baseCircle,
        borderColor: color,
      },
    };
  }

  // Use conic gradient approach with border
  const angle = Math.min(progress, 100) * 3.6; // Convert percentage to degrees

  const progressCircle = {
    ...baseCircle,
    borderColor: 'transparent',
    borderTopColor: color,
    borderRightColor: angle > 90 ? color : 'transparent',
    borderBottomColor: angle > 180 ? color : 'transparent',
    borderLeftColor: angle > 270 ? color : 'transparent',
    transform: [{ rotate: `${-90 + angle}deg` }],
  };

  return {
    backgroundCircle,
    progressCircle,
    fullCircle: null,
  };
}
