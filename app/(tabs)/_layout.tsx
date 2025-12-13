import { NativeTabs, VectorIcon, Icon, Label } from 'expo-router/unstable-native-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

// VectorIcon requires 'as any' cast for icon families - this is an expo-router typing limitation
const IconFamily = Ionicons as any;

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
        <Icon src={<VectorIcon family={IconFamily} name="home" />} />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="track">
        <Icon src={<VectorIcon family={IconFamily} name="add-circle" />} />
        <Label>Track</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="journal">
        <Icon src={<VectorIcon family={IconFamily} name="book" />} />
        <Label>Journal</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <Icon src={<VectorIcon family={IconFamily} name="analytics" />} />
        <Label>Insights</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon src={<VectorIcon family={IconFamily} name="person" />} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
