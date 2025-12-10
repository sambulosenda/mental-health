import { NativeTabs, VectorIcon, Icon, Label } from 'expo-router/unstable-native-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function TabLayout() {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  return (
    <NativeTabs
      iconColor={themeColors.textMuted}
      tintColor={themeColors.primary}
      backgroundColor={themeColors.surface}
      indicatorColor={themeColors.primary}
    >
      <NativeTabs.Trigger name="index">
        <Icon src={<VectorIcon family={Ionicons as any} name="home" />} />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="track">
        <Icon src={<VectorIcon family={Ionicons as any} name="add-circle" />} />
        <Label>Track</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="journal">
        <Icon src={<VectorIcon family={Ionicons as any} name="book" />} />
        <Label>Journal</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <Icon src={<VectorIcon family={Ionicons as any} name="analytics" />} />
        <Label>Insights</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon src={<VectorIcon family={Ionicons as any} name="person" />} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
