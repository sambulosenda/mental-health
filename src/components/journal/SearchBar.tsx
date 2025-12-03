import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/src/constants/theme';

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
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={20}
        color={colors.textMuted}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
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
          style={styles.clearButton}
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
