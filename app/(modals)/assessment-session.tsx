import { useState, useCallback, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Button, Text } from '@/src/components/ui';
import { LikertQuestion, AssessmentComplete } from '@/src/components/assessments';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAssessmentStore } from '@/src/stores';
import type { AssessmentType, LikertValue, SeverityLevel } from '@/src/types/assessment';

export default function AssessmentSessionScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: AssessmentType }>();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const [completedResult, setCompletedResult] = useState<{
    totalScore: number;
    severity: SeverityLevel;
  } | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Track if PHQ-9 Q9 was EVER answered with >=1 (persists even if changed back to 0)
  const q9EverPositive = useRef(false);

  const {
    assessmentFlow,
    isLoading,
    error,
    saveError,
    startAssessment,
    setResponse,
    advanceQuestion,
    goBackQuestion,
    completeAssessment,
    abandonAssessment,
    reset,
  } = useAssessmentStore();

  useEffect(() => {
    if (type && !assessmentFlow && !isLoading && !error) {
      startAssessment(type);
    }
  }, [type, assessmentFlow, isLoading, error, startAssessment]);

  const handleClose = useCallback(() => {
    if (assessmentFlow && assessmentFlow.currentQuestionIndex > -1) {
      Alert.alert(
        'Leave Assessment?',
        'Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              await abandonAssessment();
              router.back();
            },
          },
        ]
      );
    } else {
      abandonAssessment().then(() => router.back());
    }
  }, [assessmentFlow, abandonAssessment, router]);

  const handleComplete = useCallback(async () => {
    // Check for PHQ-9 Q9 safety concern - use ref to catch if EVER positive
    if (assessmentFlow?.template.id === 'phq9' && q9EverPositive.current) {
      setShowSafetyModal(true);
      return;
    }

    const result = await completeAssessment();
    if (result) {
      setCompletedResult(result);
    }
  }, [assessmentFlow, completeAssessment]);

  const handleSafetyAcknowledged = useCallback(async () => {
    setShowSafetyModal(false);
    const result = await completeAssessment();
    if (result) {
      setCompletedResult(result);
    }
  }, [completeAssessment]);

  const handleDone = useCallback(() => {
    router.back();
  }, [router]);

  const handleCrisisResources = useCallback(() => {
    setShowSafetyModal(false);
    router.replace('/crisis');
  }, [router]);

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
          <Button onPress={() => { reset(); router.back(); }}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!assessmentFlow) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const { template, currentQuestionIndex, responses } = assessmentFlow;
  const accentColor = template.color;
  const totalQuestions = template.questions.length;

  // Flow: intro (-1) → questions (0 to n-1) → complete (shown via completedResult)
  const isIntroStep = currentQuestionIndex === -1;
  const isQuestionStep = currentQuestionIndex >= 0 && currentQuestionIndex < totalQuestions;
  const currentQuestion = isQuestionStep ? template.questions[currentQuestionIndex] : null;

  // Check if current question is answered
  const canContinue = isIntroStep || (currentQuestion && responses[currentQuestion.id] !== undefined);

  // Safety Modal
  if (showSafetyModal) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
        <View className="flex-1 px-6 justify-center">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-6 self-center"
            style={{ backgroundColor: `${colors.error}20` }}
          >
            <Ionicons name="heart" size={32} color={colors.error} />
          </View>

          <Text variant="h2" color="textPrimary" center className="mb-4">
            We're Here for You
          </Text>

          <Text variant="body" color="textSecondary" center className="mb-8">
            Your response indicates you may be having thoughts of self-harm. Your wellbeing matters, and support is available.
          </Text>

          <View className="gap-3">
            <Button onPress={handleCrisisResources}>
              View Crisis Resources
            </Button>

            <Button variant="secondary" onPress={handleSafetyAcknowledged}>
              Continue to Results
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Completed state
  if (completedResult) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
        edges={['top']}
      >
        <Animated.View entering={FadeIn} className="flex-1">
          <AssessmentComplete
            template={template}
            totalScore={completedResult.totalScore}
            severity={completedResult.severity}
            onDone={handleDone}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      edges={['top']}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={currentQuestionIndex > -1 ? goBackQuestion : handleClose}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons
            name={currentQuestionIndex > -1 ? 'chevron-back' : 'close'}
            size={24}
            color={themeColors.textPrimary}
          />
        </Pressable>

        <Text variant="bodyMedium" color="textPrimary">
          {template.name}
        </Text>

        <Pressable onPress={handleClose} className="w-10 h-10 items-center justify-center">
          <Ionicons name="close" size={24} color={themeColors.textMuted} />
        </Pressable>
      </View>

      {/* Progress Bar */}
      {!isIntroStep && (
        <View className="px-6 mb-4">
          <View
            className="h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: themeColors.border }}
          >
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: accentColor,
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </View>
        </View>
      )}

      {/* Save Error Warning (non-blocking) */}
      {saveError && (
        <View
          className="mx-6 mb-4 px-3 py-2 rounded-lg flex-row items-center"
          style={{ backgroundColor: `${colors.warning}20` }}
        >
          <Ionicons name="alert-circle" size={16} color={colors.warning} />
          <Text variant="caption" style={{ color: colors.warning, marginLeft: 8, flex: 1 }}>
            {saveError}
          </Text>
        </View>
      )}

      {/* Content */}
      <View className="flex-1">
        {isIntroStep && (
          <Animated.View
            entering={FadeIn}
            className="flex-1 px-6 justify-center"
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-6 self-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Ionicons
                name={template.icon as any}
                size={32}
                color={accentColor}
              />
            </View>

            <Text variant="h2" color="textPrimary" center className="mb-4">
              {template.name}
            </Text>

            <Text variant="body" color="textSecondary" center className="mb-2">
              {template.description}
            </Text>

            <Text variant="body" color="textSecondary" center className="mb-8">
              Over the last <Text style={{ fontWeight: '600' }}>2 weeks</Text>, how often have you been bothered by the following problems?
            </Text>

            <View
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: themeColors.surfaceElevated }}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={16} color={themeColors.textMuted} />
                <Text variant="caption" color="textMuted" className="ml-2">
                  Takes about 2 minutes
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="help-circle-outline" size={16} color={themeColors.textMuted} />
                <Text variant="caption" color="textMuted" className="ml-2">
                  {totalQuestions} questions
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {isQuestionStep && currentQuestion && (
          <Animated.View
            key={currentQuestion.id}
            entering={SlideInRight.duration(200)}
            exiting={SlideOutLeft.duration(200)}
            className="flex-1 pt-4"
          >
            <LikertQuestion
              questionText={currentQuestion.text}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              selectedValue={responses[currentQuestion.id]}
              onSelect={(value: LikertValue) => {
                // Track if PHQ-9 Q9 is ever answered positively
                if (currentQuestion.id === 'phq9_q9' && value >= 1) {
                  q9EverPositive.current = true;
                }
                setResponse(currentQuestion.id, value);
              }}
              accentColor={accentColor}
            />
          </Animated.View>
        )}
      </View>

      {/* Continue Button */}
      <View className="px-6 pb-6">
        <Button
          onPress={() => {
            if (currentQuestionIndex === totalQuestions - 1) {
              // Last question, complete
              handleComplete();
            } else {
              advanceQuestion();
            }
          }}
          disabled={!canContinue}
          style={{
            backgroundColor: canContinue ? accentColor : themeColors.border,
          }}
        >
          {isIntroStep ? 'Start Assessment' : currentQuestionIndex === totalQuestions - 1 ? 'Complete' : 'Continue'}
        </Button>
      </View>
    </SafeAreaView>
  );
}
