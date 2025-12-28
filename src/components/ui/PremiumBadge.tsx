import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PremiumBadgeProps {
  size?: 'sm' | 'md';
}

/**
 * Consistent premium/locked indicator badge.
 * Use on top-right corner of cards to indicate premium content.
 */
export function PremiumBadge({ size = 'sm' }: PremiumBadgeProps) {
  const dimensions = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <View
      className={`${dimensions} rounded-full items-center justify-center`}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <Ionicons name="lock-closed" size={iconSize} color="#fff" />
    </View>
  );
}
