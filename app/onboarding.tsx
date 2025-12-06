import { useState, useRef } from 'react';
import {
  View,
  Dimensions,
  FlatList,
  type ViewToken,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { Text, Button } from '@/src/components/ui';
import { useSettingsStore } from '@/src/stores';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'heart',
    title: 'Welcome to DaySi',
    description: 'Your personal companion for emotional wellness and self-discovery.',
    color: colors.mood[4],
  },
  {
    id: '2',
    icon: 'analytics',
    title: 'Track Your Mood',
    description: 'Log how you feel throughout the day and discover patterns in your emotions.',
    color: colors.mood[5],
  },
  {
    id: '3',
    icon: 'book',
    title: 'Journal Your Thoughts',
    description: 'Express yourself freely with guided prompts or free-form entries.',
    color: colors.mood[3],
  },
  {
    id: '4',
    icon: 'sparkles',
    title: 'Discover Insights',
    description: 'Understand what affects your mood and learn to thrive.',
    color: colors.primaryLight,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { setOnboardingComplete } = useSettingsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setOnboardingComplete();
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View
      style={{ width }}
      className="flex-1 justify-center items-center px-8"
    >
      <View
        className="w-[140px] h-[140px] rounded-full justify-center items-center mb-8"
        style={{ backgroundColor: item.color }}
      >
        <Ionicons name={item.icon} size={64} color={themeColors.textPrimary} />
      </View>
      <Text variant="h1" color="textPrimary" center className="mb-4">
        {item.title}
      </Text>
      <Text variant="body" color="textSecondary" center style={{ maxWidth: 280 }}>
        {item.description}
      </Text>
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
    >
      <View className="h-[50px] flex-row justify-end px-6">
        {!isLastSlide && (
          <Pressable onPress={handleSkip} className="p-2">
            <Text variant="captionMedium" color="textSecondary">
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      />

      <View className="px-8 pb-8">
        <View className="flex-row justify-center items-center mb-8 gap-2">
          {slides.map((_, index) => (
            <View
              key={index}
              className="h-2 rounded-full"
              style={{
                width: index === currentIndex ? 24 : 8,
                backgroundColor: index === currentIndex ? themeColors.primary : themeColors.border,
              }}
            />
          ))}
        </View>

        <Button onPress={handleNext} fullWidth>
          {isLastSlide ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </SafeAreaView>
  );
}
