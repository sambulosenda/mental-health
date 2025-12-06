import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, darkColors, typography } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = 'Search entries...',
}: SearchBarProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      className={`flex-row items-center rounded-md px-4 h-11 ${
        isDark ? 'bg-surface-dark-elevated' : 'bg-surface-elevated'
      }`}
    >
      <Ionicons
        name="search"
        size={20}
        color={themeColors.textMuted}
        style={{ marginRight: 8 }}
      />
      <TextInput
        className="flex-1 h-full"
        style={[typography.body, { color: themeColors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          className="p-1 ml-1"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={20} color={themeColors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}
