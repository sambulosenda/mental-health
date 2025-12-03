import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, spacing, borderRadius, activityTags, type ActivityTagId } from '@/src/constants/theme';

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
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
        style={[
          styles.tag,
          isSelected && styles.tagSelected,
          animatedStyle,
        ]}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={isSelected ? colors.primary : colors.textSecondary}
        />
        <Text
          variant="captionMedium"
          color={isSelected ? 'primary' : 'textSecondary'}
          style={styles.tagLabel}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  tagSelected: {
    backgroundColor: colors.primaryLight + '30',
    borderColor: colors.primary,
  },
  tagLabel: {
    marginLeft: spacing.xs,
  },
});
