import { NativeTabs, VectorIcon, Icon, Label } from 'expo-router/unstable-native-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/src/constants/theme';

export default function TabLayout() {
  return (
    <NativeTabs
      iconColor={colors.textMuted}
      tintColor={colors.primary}
      backgroundColor={colors.surface}
      indicatorColor={colors.primary}
    >
      <NativeTabs.Trigger name="index">
        <Icon src={<VectorIcon family={Ionicons as any} name="home-outline" />} />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="track">
        <Icon src={<VectorIcon family={Ionicons as any} name="add-circle-outline" />} />
        <Label>Track</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="journal">
        <Icon src={<VectorIcon family={Ionicons as any} name="book-outline" />} />
        <Label>Journal</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <Icon src={<VectorIcon family={Ionicons as any} name="analytics-outline" />} />
        <Label>Insights</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon src={<VectorIcon family={Ionicons as any} name="person-outline" />} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
