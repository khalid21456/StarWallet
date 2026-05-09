import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';
import { Card, Screen, Spacer, Text } from '@/src/ui';

/**
 * Stats — placeholders sized to suggest charts. Real chart rendering
 * (react-native-chart-kit is already a dependency) lands with the
 * analytics milestone.
 */
export default function StatsScreen() {
  const theme = useTheme();

  return (
    <Screen title="Stats" subtitle="Your spending at a glance">
      <Card>
        <Text variant="caption" tone="textSecondary">
          Spending this month
        </Text>
        <Spacer size="sm" />
        <View
          style={{
            height: 180,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.background,
          }}
        />
      </Card>

      <Spacer size="lg" />

      <Card>
        <Text variant="caption" tone="textSecondary">
          By category
        </Text>
        <Spacer size="sm" />
        <View
          style={{
            height: 220,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.background,
          }}
        />
      </Card>
    </Screen>
  );
}
