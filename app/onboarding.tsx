import { useState, useCallback } from 'react';
import { View, useWindowDimensions, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeIn,
} from 'react-native-reanimated';
import { useSettingsStore } from '@/src/stores';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { requestNotificationPermissions } from '@/src/lib/notifications';
import type { UserGoal } from '@/src/types/settings';

import {
  AnimatedIndexContext,
  IntroSlideContainer,
  PaginationDots,
  // BottomGlow,
  TOTAL_INTRO_SLIDES,
  // INTRO_PALETTE,
  WelcomeSlide,
  BenefitsSlide,
  PrivacySlide,
} from '@/src/components/onboarding/intro';
import { OnboardingForm } from '@/src/components/onboarding/form/OnboardingForm';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Phase = 'intro' | 'form';

export default function OnboardingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { completeOnboarding, setReminderEnabled, setReminderTime } = useSettingsStore();

  const [phase, setPhase] = useState<Phase>('intro');
  const activeIndex = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    activeIndex.set(event.contentOffset.x / width);
  });

  // Button fades in on last slide
  const rButtonStyle = useAnimatedStyle(() => {
    const lastIndex = TOTAL_INTRO_SLIDES - 1;
    const beforeLastIndex = TOTAL_INTRO_SLIDES - 2;

    return {
      opacity: interpolate(
        activeIndex.get(),
        [beforeLastIndex, lastIndex],
        [0, 1],
        Extrapolation.CLAMP
      ),
      pointerEvents: activeIndex.get() >= lastIndex - 0.2 ? 'auto' : 'none',
    };
  }, []);

  const handleGetStarted = useCallback(() => {
    setPhase('form');
  }, []);

  const handleBackToIntro = useCallback(() => {
    setPhase('intro');
  }, []);

  const handleComplete = useCallback(
    async (data: {
      name: string;
      goals: UserGoal[];
      reminders: {
        moodEnabled: boolean;
        moodTime: string;
        journalEnabled: boolean;
        journalTime: string;
      };
    }) => {
      try {
        // Save user profile
        completeOnboarding({
          name: data.name,
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
        }

        // Navigate to main app
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        Alert.alert('Something went wrong', 'Please try again.', [{ text: 'OK' }]);
      }
    },
    [completeOnboarding, setReminderEnabled, setReminderTime, router]
  );

  if (phase === 'form') {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
          <OnboardingForm
            onComplete={handleComplete}
            onBack={handleBackToIntro}
            title="Personalize"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <AnimatedIndexContext.Provider value={{ activeIndex }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#0f0f14' : themeColors.background,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        {/* Temporarily disabled to debug crash */}
        {/* <BottomGlow
          palette={INTRO_PALETTE}
          width={width}
          height={height}
          activeIndex={activeIndex}
        /> */}

        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: insets.top + 40 }}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          <IntroSlideContainer
            title={'Welcome to\nSoftmind'}
            description="Your gentle companion for emotional wellness and self-discovery. Track your mood, journal your thoughts, and find calm."
          >
            <WelcomeSlide />
          </IntroSlideContainer>

          <IntroSlideContainer
            title={'Tools for your\nwellbeing'}
            description="Track patterns in your mood, practice guided journaling, and build mindful habits that stick."
          >
            <BenefitsSlide />
          </IntroSlideContainer>

          <IntroSlideContainer
            title={'Private &\nsecure'}
            description="Your thoughts stay on your device. No cloud uploads, no tracking. Just you and your journey to better mental wellness."
          >
            <PrivacySlide />
          </IntroSlideContainer>
        </Animated.ScrollView>

        <View style={styles.bottomContainer}>
          <PaginationDots numberOfDots={TOTAL_INTRO_SLIDES} activeIndex={activeIndex} />
          <AnimatedPressable
            onPress={handleGetStarted}
            style={[
              styles.button,
              { backgroundColor: themeColors.primary },
              rButtonStyle,
            ]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </AnimatedPressable>
        </View>
      </View>
    </AnimatedIndexContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomContainer: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
