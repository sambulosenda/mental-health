import { View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Text, Button } from '@/src/components/ui';

interface CompletionStepProps {
  name: string;
  onComplete: () => void;
}

export function CompletionStep({ name, onComplete }: CompletionStepProps) {
  return (
    <View className="flex-1">
      <View className="flex-1 justify-center items-center px-8">
        <Animated.View
          entering={FadeIn.duration(600)}
          className="w-[200px] h-[200px] mb-8"
        >
          <LottieView
            source={require('@/assets/animations/onboarding-complete.json')}
            autoPlay
            loop={false}
            style={{ width: '100%', height: '100%' }}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Text variant="h1" color="textPrimary" center className="mb-3">
            You're all set{name?.trim() ? `, ${name}` : ''}!
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(550).duration(500)}>
          <Text
            variant="body"
            color="textSecondary"
            center
            style={{ maxWidth: 280 }}
          >
            Your personalized wellness journey begins now. We're here to support you every step of the way.
          </Text>
        </Animated.View>
      </View>

      <View className="px-8 pb-8">
        <Animated.View entering={FadeInUp.delay(700).duration(500)}>
          <Button onPress={onComplete} fullWidth>
            Start Your Journey
          </Button>
        </Animated.View>
      </View>
    </View>
  );
}
