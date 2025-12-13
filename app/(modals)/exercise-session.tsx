import {
  ExerciseComplete,
  ExerciseErrorBoundary,
  ExerciseHeader,
  ExerciseStepRenderer,
  MoodStepRenderer,
} from '@/src/components/exercises';
import { Button, Text } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useExerciseStore } from '@/src/stores';
import type { MoodValue } from '@/src/types/exercise';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function ExerciseSessionContent() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  // Keyboard-aware button positioning
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
    onEnd: (e) => {
      'worklet';
      keyboardHeight.value = withTiming(e.height, { duration: 100 });
    },
  });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value > 0 ? keyboardHeight.value + 16 : 24,
  }));

  const {
    exerciseFlow,
    error,
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

  // Track the current templateId to detect changes
  const currentTemplateRef = useRef<string | null>(null);

  // Handle blur for cleanup
  useFocusEffect(
    useCallback(() => {
      // On blur: reset the store to clean up (also invalidates in-flight requests)
      return () => {
        console.log('[Exercise] Screen blur, resetting store');
        reset();
        currentTemplateRef.current = null;
      };
    }, [reset])
  );

  // Start exercise when templateId changes (or on initial mount)
  useEffect(() => {
    if (!templateId) return;

    // Only start if templateId changed
    if (currentTemplateRef.current === templateId) return;

    // Reset if switching exercises
    if (currentTemplateRef.current !== null) {
      console.log('[Exercise] Template changed, resetting');
      reset();
    }

    currentTemplateRef.current = templateId;
    const sessionKey = Date.now();
    console.log('[Exercise] Starting exercise with templateId:', templateId, 'key:', sessionKey);
    startExercise(templateId, sessionKey);
  }, [templateId, startExercise, reset]);

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
              try {
                await abandonExercise();
              } catch (error) {
                console.error('Failed to abandon exercise:', error);
              }
              router.back();
            },
          },
        ]
      );
    } else {
      abandonExercise()
        .then(() => router.back())
        .catch((error) => {
          console.error('Failed to abandon exercise:', error);
          router.back();
        });
    }
  }, [exerciseFlow, abandonExercise, router]);

  const handleComplete = useCallback(async () => {
    try {
      await completeExercise();
      router.back();
    } catch (error) {
      console.error('Failed to complete exercise:', error);
      Alert.alert('Error', 'Failed to save exercise. Please try again.');
    }
  }, [completeExercise, router]);

  if (error) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="h3" color="error" center className="mb-4">
            Something went wrong
          </Text>
          <Text variant="body" color="textSecondary" center className="mb-6">
            {error}
          </Text>
          <Button onPress={async () => {
            try { await abandonExercise(); } catch { /* ignore - session may not exist */ }
            reset();
            router.back();
          }}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!exerciseFlow) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={themeColors.primary} />
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
        <Animated.View style={[{ paddingHorizontal: 24 }, animatedButtonStyle]}>
          <Button
            onPress={handleContinue}
            disabled={!canContinue}
            style={{
              backgroundColor: canContinue ? accentColor : themeColors.border,
            }}
          >
            Continue
          </Button>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

export default function ExerciseSessionScreen() {
  const router = useRouter();
  const { reset } = useExerciseStore();

  const handleErrorReset = () => {
    reset();
    router.back();
  };

  return (
    <ExerciseErrorBoundary onReset={handleErrorReset}>
      <ExerciseSessionContent />
    </ExerciseErrorBoundary>
  );
}
