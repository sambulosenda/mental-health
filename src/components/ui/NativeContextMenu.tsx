import { Platform, View, ActionSheetIOS, Alert } from 'react-native';
import { ReactNode } from 'react';
import { ContextMenu, Button, Host } from '@expo/ui/swift-ui';
import type { SFSymbols7_0 } from 'sf-symbols-typescript';
import { haptics } from '@/src/utils/haptics';

export interface ContextMenuAction {
  title: string;
  systemIcon?: SFSymbols7_0;
  destructive?: boolean;
  onPress: () => void;
}

interface NativeContextMenuProps {
  children: ReactNode;
  title?: string;
  actions: ContextMenuAction[];
  onOpenChange?: (isOpen: boolean) => void;
}

export function NativeContextMenu({
  children,
  actions,
}: NativeContextMenuProps) {
  // Use native ContextMenu on iOS
  if (Platform.OS === 'ios') {
    return (
      <Host matchContents>
        <ContextMenu>
          <ContextMenu.Items>
            {actions.map((action, index) => (
              <Button
                key={index}
                systemImage={action.systemIcon}
                onPress={() => {
                  haptics.light();
                  action.onPress();
                }}
              >
                {action.title}
              </Button>
            ))}
          </ContextMenu.Items>
          <ContextMenu.Trigger>
            {children}
          </ContextMenu.Trigger>
        </ContextMenu>
      </Host>
    );
  }

  // Fallback for Android - just render children (use long press handler)
  return <View>{children}</View>;
}

// Helper for long press context menu behavior
export function showContextMenuFallback(title: string | undefined, actions: ContextMenuAction[]) {
  haptics.medium();

  if (Platform.OS === 'ios') {
    const options = ['Cancel', ...actions.map(a => a.title)];
    const destructiveIndex = actions.findIndex(a => a.destructive);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: 0,
        destructiveButtonIndex: destructiveIndex >= 0 ? destructiveIndex + 1 : undefined,
        title,
      },
      (buttonIndex) => {
        if (buttonIndex > 0) {
          actions[buttonIndex - 1]?.onPress();
        }
      }
    );
  } else {
    Alert.alert(
      title || 'Options',
      undefined,
      [
        ...actions.map(action => ({
          text: action.title,
          onPress: action.onPress,
          style: action.destructive ? 'destructive' as const : 'default' as const,
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }
}
