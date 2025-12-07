import { useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useExerciseStore } from '@/src/stores';
import {
  ExerciseHeader,
  ExerciseStepRenderer,
  MoodStepRenderer,
  ExerciseComplete,
} from '@/src/components/exercises';
import { Button } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { MoodValue } from '@/src/types/exercise';

export default function ExerciseSessionScreen() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const {
    exerciseFlow,
    startExercise,
    setMoodBefore,
    setMoodAfter,
    advanceStep,
    goBackStep,
    setStepResponse,
    completeExercise,
    abandonExercise,
    reset,
  } = useExerciseStore();

  useEffect(() => {
    if (templateId && !exerciseFlow) {
      startExercise(templateId);
    }

    return () => {
      // Don't reset on unmount - let the store handle state
    };
  }, [templateId]);

  const handleClose = useCallback(() => {
    if (exerciseFlow && exerciseFlow.currentStepIndex > 0) {
      Alert.alert(
        'Leave Exercise?',
        'Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              await abandonExercise();
              router.back();
            },
          },
        ]
      );
    } else {
      abandonExercise();
      router.back();
    }
  }, [exerciseFlow, abandonExercise, router]);

  const handleComplete = useCallback(async () => {
    await completeExercise();
    router.back();
  }, [completeExercise, router]);

  if (!exerciseFlow) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
        <View className="flex-1 items-center justify-center">
          {/* Loading state */}
        </View>
      </SafeAreaView>
    );
  }

  const { template, currentStepIndex, responses, moodBefore, moodAfter } = exerciseFlow;
  const accentColor = template.color || themeColors.primary;

  // Flow structure: mood_before (0) → exercise steps (1 to n) → mood_after (n+1) → complete (n+2)
  const totalSteps = template.steps.length + 3; // mood_before + steps + mood_after + complete
  const isMoodBeforeStep = currentStepIndex === 0;
  const isMoodAfterStep = currentStepIndex === template.steps.length + 1;
  const isCompleteStep = currentStepIndex === template.steps.length + 2;
  const exerciseStepIndex = currentStepIndex - 1; // Index into template.steps
  const currentExerciseStep = !isMoodBeforeStep && !isMoodAfterStep && !isCompleteStep
    ? template.steps[exerciseStepIndex]
    : null;

  // Determine if we can continue
  const canContinue = (() => {
    if (isMoodBeforeStep) return !!moodBefore;
    if (isMoodAfterStep) return !!moodAfter;
    if (isCompleteStep) return true;
    if (!currentExerciseStep) return false;

    // Check if step is required and has value
    if (!currentExerciseStep.required) return true;

    const response = responses[currentExerciseStep.id];
    if (currentExerciseStep.type === 'multi_input') {
      const values = Array.isArray(response) ? response : [];
      const inputCount = currentExerciseStep.inputCount || 0;
      // Check all required inputs are filled (non-empty after trim)
      return values.length >= inputCount &&
        values.slice(0, inputCount).every(v => typeof v === 'string' && v.trim().length > 0);
    }
    if (currentExerciseStep.type === 'text_input' || currentExerciseStep.type === 'reflection') {
      return typeof response === 'string' && response.trim().length > 0;
    }
    if (currentExerciseStep.type === 'instruction') return true;
    if (currentExerciseStep.type === 'breathing') {
      // Breathing step has its own completion flow
      return true;
    }
    return true;
  })();

  const handleContinue = () => {
    if (isCompleteStep) {
      handleComplete();
    } else {
      advanceStep();
    }
  };

  const handleStepResponse = (value: string | string[]) => {
    if (currentExerciseStep) {
      setStepResponse(currentExerciseStep.id, value);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      edges={['top']}
    >
      {!isCompleteStep && (
        <ExerciseHeader
          title={template.name}
          currentStep={currentStepIndex}
          totalSteps={totalSteps - 1} // Don't count complete in progress
          onClose={handleClose}
          onBack={goBackStep}
          canGoBack={currentStepIndex > 0}
          accentColor={accentColor}
        />
      )}

      <View className="flex-1">
        {isMoodBeforeStep && (
          <MoodStepRenderer
            type="mood_before"
            selectedMood={moodBefore || null}
            onSelectMood={(mood: MoodValue) => setMoodBefore(mood)}
          />
        )}

        {isMoodAfterStep && (
          <MoodStepRenderer
            type="mood_after"
            selectedMood={moodAfter || null}
            onSelectMood={(mood: MoodValue) => setMoodAfter(mood)}
          />
        )}

        {isCompleteStep && (
          <ExerciseComplete
            exerciseName={template.name}
            moodBefore={moodBefore}
            moodAfter={moodAfter}
            onDone={handleComplete}
            accentColor={accentColor}
          />
        )}

        {currentExerciseStep && (
          <ExerciseStepRenderer
            step={currentExerciseStep}
            value={responses[currentExerciseStep.id] || (currentExerciseStep.type === 'multi_input' ? [] : '')}
            onChange={handleStepResponse}
            onBreathingComplete={advanceStep}
            accentColor={accentColor}
          />
        )}
      </View>

      {/* Continue button (not shown for complete step or breathing step) */}
      {!isCompleteStep && currentExerciseStep?.type !== 'breathing' && (
        <View className="px-6 pb-6">
          <Button
            onPress={handleContinue}
            disabled={!canContinue}
            style={{
              backgroundColor: canContinue ? accentColor : themeColors.border,
            }}
          >
            Continue
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
