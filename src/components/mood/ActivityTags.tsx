import { View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, darkColors, spacing, activityTags, type ActivityTagId } from '@/src/constants/theme';
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
    <View className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}
      >
        {activityTags.map((tag) => (
          <ActivityTag
            key={tag.id}
            id={tag.id}
            label={tag.label}
            icon={tag.icon}
            isSelected={selectedActivities.includes(tag.id)}
            onPress={() => onToggleActivity(tag.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface ActivityTagProps {
  id: ActivityTagId;
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}

function ActivityTag({ id, label, icon, isSelected, onPress }: ActivityTagProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(isSelected ? 1 : 1.05, { damping: 15 });
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
        className="flex-row items-center px-4 py-2 rounded-full border-[1.5px]"
        style={[
          {
            backgroundColor: isSelected
              ? themeColors.primaryLight + '30'
              : themeColors.surfaceElevated,
            borderColor: isSelected ? themeColors.primary : themeColors.border,
          },
          animatedStyle,
        ]}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={isSelected ? themeColors.primary : themeColors.textSecondary}
        />
        <Text
          variant="captionMedium"
          color={isSelected ? 'primary' : 'textSecondary'}
          className="ml-1"
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
