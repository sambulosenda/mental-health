import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, Button, Card } from '@/src/components/ui';
import { MoodAnimation } from '@/src/components/mood';
import { colors, moodLabels } from '@/src/constants/theme';

interface CheckinSummaryProps {
  suggestedMood: 1 | 2 | 3 | 4 | 5;
  onLogMood: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export function CheckinSummary({
  suggestedMood,
  onLogMood,
  onSkip,
  isLoading,
}: CheckinSummaryProps) {
  const moodInfo = moodLabels[suggestedMood];

  return (
    <Animated.View entering={FadeInUp.duration(400)} className="px-4 pb-4">
      <Card variant="flat" className="items-center py-6">
        <Text variant="caption" color="textMuted" className="mb-2">
          Based on our conversation
        </Text>

        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: colors.mood[suggestedMood] }}
        >
          <MoodAnimation mood={suggestedMood} size={48} />
        </View>

        <Text variant="h3" color="textPrimary" className="mb-1">
          {moodInfo.label}
        </Text>
        <Text variant="body" color="textSecondary" center className="mb-6 px-4">
          Would you like to save this as a mood check-in?
        </Text>

        <View className="flex-row gap-3 w-full px-4">
          <Button
            variant="secondary"
            size="md"
            onPress={onSkip}
            disabled={isLoading}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            variant="primary"
            size="md"
            onPress={onLogMood}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Log Mood'}
          </Button>
        </View>
      </Card>
    </Animated.View>
  );
}
