import { View, Keyboard } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Text, Button, Input } from '@/src/components/ui';

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function NameStep({ name, onNameChange, onNext, onBack }: NameStepProps) {
  const trimmedName = name.trim();
  const isValid = trimmedName.length >= 2 && trimmedName.length <= 30;

  const handleContinue = () => {
    Keyboard.dismiss();
    onNext();
  };

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center px-8">
        <Animated.View entering={FadeIn.duration(400)}>
          <Text variant="h1" color="textPrimary" center className="mb-3">
            What should we call you?
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text
            variant="body"
            color="textSecondary"
            center
            className="mb-8"
          >
            This helps us personalize your experience
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).duration(400)}>
          <Input
            value={name}
            onChangeText={onNameChange}
            placeholder="Enter your name"
            maxLength={30}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={isValid ? handleContinue : undefined}
            className="mb-2"
            autoFocus
          />
        </Animated.View>
      </View>

      <View className="px-8 pb-8 gap-3">
        <Button onPress={handleContinue} fullWidth disabled={!isValid}>
          Continue
        </Button>
        <Button variant="ghost" onPress={onBack} fullWidth>
          Back
        </Button>
      </View>
    </View>
  );
}
