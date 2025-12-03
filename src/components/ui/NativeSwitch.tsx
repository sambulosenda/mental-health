import { Switch } from 'react-native';
import { colors } from '@/src/constants/theme';

interface NativeSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function NativeSwitch({ value, onValueChange, disabled }: NativeSwitchProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.border, true: colors.primaryLight }}
      thumbColor={value ? colors.primary : colors.surface}
    />
  );
}
