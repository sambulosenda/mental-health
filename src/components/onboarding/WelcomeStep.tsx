import { View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Text, Button } from '@/src/components/ui';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center items-center px-8">
        <Animated.View
          entering={FadeIn.duration(600)}
          className="w-[200px] h-[200px] mb-8"
        >
          <LottieView
            source={require('@/assets/animations/onboarding-welcome.json')}
            autoPlay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Text variant="h1" color="textPrimary" center className="mb-3">
            Welcome to Softmind
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(500)}>
          <Text
            variant="body"
            color="textSecondary"
            center
            style={{ maxWidth: 280 }}
          >
            Your daily companion for emotional wellness and self-discovery
          </Text>
        </Animated.View>
      </View>

      <View className="px-8 pb-8">
        <Animated.View entering={FadeInUp.delay(600).duration(500)}>
          <Button onPress={onNext} fullWidth>
            Get Started
          </Button>
        </Animated.View>
      </View>
    </View>
  );
}
