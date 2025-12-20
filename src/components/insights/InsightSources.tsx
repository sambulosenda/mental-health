import { memo, useState } from 'react';
import { View, Linking, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { WELLNESS_SOURCES, INSIGHTS_DISCLAIMER, PATTERN_METHODOLOGY, LEARN_MORE_HEADER } from '@/src/constants/sources';
import { useTheme } from '@/src/contexts/ThemeContext';

export const InsightSources = memo(function InsightSources() {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const [expanded, setExpanded] = useState(true);

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Card variant="flat" className="mt-4">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          <View
            className="w-8 h-8 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: isDark ? `${themeColors.textMuted}20` : `${themeColors.textMuted}15` }}
          >
            <Ionicons name="information-circle-outline" size={18} color={themeColors.textMuted} />
          </View>
          <Text variant="bodyMedium" color="textSecondary">
            About AI Insights
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={themeColors.textMuted}
        />
      </Pressable>

      {expanded && (
        <View className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#333' : '#eee' }}>
          <Text variant="caption" color="textMuted" className="mb-3" style={{ lineHeight: 18 }}>
            {INSIGHTS_DISCLAIMER}
          </Text>

          <Text variant="caption" color="textMuted" className="mb-4" style={{ lineHeight: 18 }}>
            {PATTERN_METHODOLOGY}
          </Text>

          <Text variant="captionMedium" color="textSecondary" className="mb-2">
            {LEARN_MORE_HEADER}
          </Text>

          {WELLNESS_SOURCES.map((source) => (
            <Pressable
              key={source.id}
              onPress={() => openLink(source.url)}
              className="flex-row items-start py-2"
            >
              <Ionicons
                name="link-outline"
                size={14}
                color={themeColors.primary}
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <View className="flex-1">
                <Text variant="caption" color="primary" style={{ textDecorationLine: 'underline' }}>
                  {source.title}
                </Text>
                <Text variant="caption" color="textMuted">
                  {source.organization}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
});
