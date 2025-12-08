import { View } from 'react-native';
import { Text } from '@/src/components/ui';
import { SEVERITY_CONFIG } from '@/src/constants/assessments';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { SeverityLevel } from '@/src/types/assessment';

interface ScoreInterpretationProps {
  severity: SeverityLevel;
  compact?: boolean;
}

export function ScoreInterpretation({ severity, compact }: ScoreInterpretationProps) {
  const { isDark } = useTheme();
  const config = SEVERITY_CONFIG[severity];

  if (compact) {
    return (
      <View
        className="px-2 py-1 rounded-lg"
        style={{
          backgroundColor: isDark ? config.darkBgColor : config.bgColor,
        }}
      >
        <Text
          variant="caption"
          style={{ color: config.color, fontWeight: '600' }}
        >
          {config.label}
        </Text>
      </View>
    );
  }

  return (
    <View
      className="px-4 py-2 rounded-xl"
      style={{
        backgroundColor: isDark ? config.darkBgColor : config.bgColor,
      }}
    >
      <Text
        variant="bodyMedium"
        style={{ color: config.color, fontWeight: '600' }}
      >
        {config.label}
      </Text>
    </View>
  );
}
