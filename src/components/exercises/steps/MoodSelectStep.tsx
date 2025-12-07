
import { MoodSliderSelector } from '@/src/components/mood/MoodSliderSelector';
import { Text } from '@/src/components/ui';
import type { MoodValue } from '@/src/types/exercise';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface MoodSelectStepProps {
  title: string;
  subtitle: string;
  selectedMood: MoodValue | null;
  onSelectMood: (mood: MoodValue) => void;
}

export function MoodSelectStep({
  title,
  subtitle,
  selectedMood,
  onSelectMood,
}: MoodSelectStepProps) {
  return (
    <Animated.View entering={FadeIn.duration(300)} className="flex-1 px-6 py-4">
      <View className="mb-8">
        <Text variant="h2" color="textPrimary" center className="mb-2">
          {title}
        </Text>
        <Text variant="body" color="textSecondary" center>
          {subtitle}
        </Text>
      </View>

      <MoodSliderSelector
        selectedMood={selectedMood}
        onSelectMood={onSelectMood}
      />
    </Animated.View>
  );
}
