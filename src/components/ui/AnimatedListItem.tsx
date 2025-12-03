import { ReactNode } from 'react';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface AnimatedListItemProps {
  index: number;
  children: ReactNode;
}

export function AnimatedListItem({ index, children }: AnimatedListItemProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 50)
        .springify()
        .damping(15)
        .stiffness(100)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify().damping(15)}
    >
      {children}
    </Animated.View>
  );
}
