import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, darkColors, activityTags, type ActivityTagId } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface ActivityTagsProps {
  selectedActivities: ActivityTagId[];
  onToggleActivity: (activity: ActivityTagId) => void;
}

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  briefcase: 'briefcase-outline',
  fitness: 'fitness-outline',
  people: 'people-outline',
  home: 'home-outline',
  moon: 'moon-outline',
  restaurant: 'restaurant-outline',
  leaf: 'leaf-outline',
  'color-palette': 'color-palette-outline',
  cafe: 'cafe-outline',
  medkit: 'medkit-outline',
};

export function ActivityTags({ selectedActivities, onToggleActivity }: ActivityTagsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {activityTags.map((tag) => (
        <ActivityChip
          key={tag.id}
          id={tag.id}
          label={tag.label}
          icon={tag.icon}
          isSelected={selectedActivities.includes(tag.id)}
          onPress={() => onToggleActivity(tag.id)}
        />
      ))}
    </View>
  );
}

interface ActivityChipProps {
  id: ActivityTagId;
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}

function ActivityChip({ label, icon, isSelected, onPress }: ActivityChipProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withSpring(0.92, { damping: 15 }),
      withSpring(1, { damping: 12 })
    );
    onPress();
  };

  const iconName = iconMap[icon] || 'ellipse-outline';

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: isSelected }}
    >
      <Animated.View
        className="flex-row items-center px-3 py-2 rounded-full"
        style={[
          {
            backgroundColor: isSelected
              ? themeColors.primary
              : themeColors.surfaceElevated,
          },
          animatedStyle,
        ]}
      >
        <Ionicons
          name={iconName}
          size={16}
          color={isSelected ? '#FFFFFF' : themeColors.textSecondary}
          style={{ marginRight: 6 }}
        />
        <Text
          variant="caption"
          style={{
            color: isSelected ? '#FFFFFF' : themeColors.textSecondary,
            fontWeight: isSelected ? '600' : '500',
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
