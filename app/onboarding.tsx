import { useState, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSettingsStore } from '@/src/stores';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { requestNotificationPermissions } from '@/src/lib/notifications';
import { ONBOARDING_STEPS } from '@/src/constants/onboarding';
import type { OnboardingStep } from '@/src/constants/onboarding';
import type { UserGoal } from '@/src/types/settings';
import {
  WelcomeStep,
  NameStep,
  GoalsStep,
  RemindersStep,
  CompletionStep,
  OnboardingProgress,
} from '@/src/components/onboarding';


interface OnboardingData {
  name: string;
  goals: UserGoal[];
  reminders: {
    moodEnabled: boolean;
    moodTime: string;
    journalEnabled: boolean;
    journalTime: string;
  };
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const {
    completeOnboarding,
    setReminderEnabled,
    setReminderTime,
  } = useSettingsStore();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [data, setData] = useState<OnboardingData>({
    name: '',
    goals: [],
    reminders: {
      moodEnabled: false,
      moodTime: '09:00',
      journalEnabled: false,
      journalTime: '20:00',
    },
  });

  const currentStepIndex = ONBOARDING_STEPS.indexOf(currentStep);

  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(ONBOARDING_STEPS[nextIndex]);
    }
  }, [currentStepIndex]);

  const goBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(ONBOARDING_STEPS[prevIndex]);
    }
  }, [currentStepIndex]);

  const handleNameChange = useCallback((name: string) => {
    setData((prev) => ({ ...prev, name }));
  }, []);

  const handleGoalsChange = useCallback((goals: UserGoal[]) => {
    setData((prev) => ({ ...prev, goals }));
  }, []);

  const handleRemindersChange = useCallback((reminders: OnboardingData['reminders']) => {
    setData((prev) => ({ ...prev, reminders }));
  }, []);

  const handleComplete = useCallback(async () => {
    try {
      // Save user profile
      completeOnboarding({
        name: data.name.trim(),
        goals: data.goals,
      });

      // Set up reminders if enabled
      const needsPermissions = data.reminders.moodEnabled || data.reminders.journalEnabled;

      if (needsPermissions) {
        const hasPermission = await requestNotificationPermissions();

        if (hasPermission) {
          if (data.reminders.moodEnabled) {
            await setReminderTime('mood', data.reminders.moodTime);
            await setReminderEnabled('mood', true);
          }

          if (data.reminders.journalEnabled) {
            await setReminderTime('journal', data.reminders.journalTime);
            await setReminderEnabled('journal', true);
          }
        }
        // If no permission, we still continue - reminders just won't be set
      }

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      Alert.alert(
        'Something went wrong',
        'Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [data, completeOnboarding, setReminderEnabled, setReminderTime, router]);

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <Animated.View key="welcome" entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)} className="flex-1">
            <WelcomeStep onNext={goNext} />
          </Animated.View>
        );
      case 'name':
        return (
          <Animated.View key="name" entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)} className="flex-1">
            <NameStep
              name={data.name}
              onNameChange={handleNameChange}
              onNext={goNext}
              onBack={goBack}
            />
          </Animated.View>
        );
      case 'goals':
        return (
          <Animated.View key="goals" entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)} className="flex-1">
            <GoalsStep
              name={data.name}
              goals={data.goals}
              onGoalsChange={handleGoalsChange}
              onNext={goNext}
              onBack={goBack}
            />
          </Animated.View>
        );
      case 'reminders':
        return (
          <Animated.View key="reminders" entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)} className="flex-1">
            <RemindersStep
              reminders={data.reminders}
              onRemindersChange={handleRemindersChange}
              onNext={goNext}
              onBack={goBack}
            />
          </Animated.View>
        );
      case 'complete':
        return (
          <Animated.View key="complete" entering={FadeIn.duration(400)} exiting={FadeOut.duration(150)} className="flex-1">
            <CompletionStep name={data.name} onComplete={handleComplete} />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress indicator - hide on welcome and complete steps */}
        {currentStep !== 'welcome' && currentStep !== 'complete' && (
          <Animated.View entering={FadeIn.duration(300)}>
            <OnboardingProgress
              currentStep={currentStepIndex - 1}
              totalSteps={ONBOARDING_STEPS.length - 2}
            />
          </Animated.View>
        )}

        {renderStep()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
