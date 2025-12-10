import { View, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Text, Button } from '@/src/components/ui';
import { GOALS } from '@/src/constants/onboarding';
import { GoalCard } from './GoalCard';
import type { UserGoal } from '@/src/types/settings';

interface GoalsStepProps {
  name: string;
  goals: UserGoal[];
  onGoalsChange: (goals: UserGoal[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function GoalsStep({
  name,
  goals,
  onGoalsChange,
  onNext,
  onBack,
}: GoalsStepProps) {
  const handleToggleGoal = (goalId: UserGoal) => {
    if (goals.includes(goalId)) {
      onGoalsChange(goals.filter((g) => g !== goalId));
    } else {
      onGoalsChange([...goals, goalId]);
    }
  };

  const isValid = goals.length >= 1;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Text variant="h1" color="textPrimary" center className="mb-3">
            What brings you here{name ? `, ${name}` : ''}?
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text
            variant="body"
            color="textSecondary"
            center
            className="mb-8"
          >
            Select all that apply
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(350).duration(400)}
          className="flex-row flex-wrap gap-3"
        >
          {GOALS.map((goal) => (
            <View key={goal.id} style={{ width: '47%' }}>
              <GoalCard
                goal={goal}
                selected={goals.includes(goal.id)}
                onToggle={() => handleToggleGoal(goal.id)}
              />
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <View className="px-8 pb-8 gap-3">
        <Button onPress={onNext} fullWidth disabled={!isValid}>
          Continue
        </Button>
        <Button variant="ghost" onPress={onBack} fullWidth>
          Back
        </Button>
      </View>
    </View>
  );
}
