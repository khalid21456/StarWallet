import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';
import { Card, Screen, SectionHeader, Spacer, Text } from '@/src/ui';

/**
 * Activity — placeholder transaction list. Each row mirrors the
 * structure used on Home so the live list (transactions feature) can
 * reuse a single row component later.
 */
export default function ActivityScreen() {
  const theme = useTheme();

  return (
    <Screen title="Activity" subtitle="All your recent transactions">
      <SectionHeader title="This week" />
      <Spacer size="md" />
      <Card padding="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              borderBottomWidth: i === 5 ? 0 : 1,
              borderBottomColor: theme.colors.border,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.background,
              }}
            />
            <Spacer size="md" horizontal />
            <View style={{ flex: 1 }}>
              <Text variant="body">Placeholder</Text>
              <Text variant="caption" tone="textSecondary">
                —
              </Text>
            </View>
            <Text variant="body" tone="textSecondary">
              $0.00
            </Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
