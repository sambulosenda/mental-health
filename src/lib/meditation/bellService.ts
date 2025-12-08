import * as Haptics from 'expo-haptics';

export type BellType = 'start' | 'interval' | 'end';

export function playBell(type: BellType = 'interval'): void {
  switch (type) {
    case 'start':
      // Double haptic for start
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 200);
      break;
    case 'end':
      // Triple haptic for end
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
      break;
    case 'interval':
    default:
      // Single medium haptic for interval
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
  }
}

export function playBreathCue(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
