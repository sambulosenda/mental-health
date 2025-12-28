import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute left-0 right-0 z-50"
      style={{ top: insets.top }}
    >
      <View
        className="flex-row items-center justify-center py-2 px-4 mx-4 rounded-lg"
        style={{ backgroundColor: themeColors.warning }}
      >
        <Ionicons name="cloud-offline" size={16} color="#fff" />
        <Text variant="caption" style={{ color: '#fff', marginLeft: 8 }}>
          No internet connection
        </Text>
      </View>
    </Animated.View>
  );
}
