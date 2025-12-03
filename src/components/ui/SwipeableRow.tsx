import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/src/utils/haptics';
import { colors, spacing } from '@/src/constants/theme';

interface SwipeableRowProps {
  children: ReactNode;
  onDelete: () => void;
  deleteThreshold?: number;
}

export function SwipeableRow({
  children,
  onDelete,
  deleteThreshold = -100,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue<number | null>(null);
  const isDeleting = useSharedValue(false);

  const triggerHaptic = () => {
    haptics.warning();
  };

  const triggerDelete = () => {
    onDelete();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((event) => {
      if (isDeleting.value) return;
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd(() => {
      if (isDeleting.value) return;

      const shouldDelete = translateX.value < deleteThreshold;
      if (shouldDelete) {
        isDeleting.value = true;
        runOnJS(triggerHaptic)();
        translateX.value = withTiming(-500, { duration: 200 });
        itemHeight.value = withTiming(0, { duration: 250 }, () => {
          runOnJS(triggerDelete)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: colors.background,
  }));

  const containerStyle = useAnimatedStyle(() => {
    if (itemHeight.value === null) {
      return {};
    }
    return {
      height: itemHeight.value,
      opacity: interpolate(
        itemHeight.value,
        [0, 50],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  const deleteIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [deleteThreshold, deleteThreshold / 2],
      [1, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [deleteThreshold, deleteThreshold / 2],
          [1, 0.5],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.deleteBackground}>
        <Animated.View style={[styles.deleteIcon, deleteIconStyle]}>
          <Ionicons name="trash" size={24} color="white" />
        </Animated.View>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedRowStyle}>{children}</Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  deleteIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
