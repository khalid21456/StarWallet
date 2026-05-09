import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';

import { DEFAULT_CATEGORIES } from '@/src/constants/categories';
import { useTheme } from '@/src/hooks/use-theme';
import { Card, IconBubble, Screen, SectionHeader, Spacer, Text } from '@/src/ui';

// Bundled via Metro's static-asset resolver — `require` is the
// correct API for local images (URI strings only work for remotes).
const PROFILE_IMAGE = require('../../assets/images/profile.png');

/**
 * Home — visual placeholder that mirrors the reference fintech screen:
 * top greeting + profile avatar, balance hero, budget progress,
 * category row, recent activity header. Numbers are static — replaced
 * by API data in a later milestone.
 */
export default function HomeScreen() {
  const theme = useTheme();

  return (
    <Screen>
      {/* Header — greeting on the left, profile avatar on the right */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.lg,
        }}
      >
        <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
          <Text variant="heading">Welcome back</Text>
          <Spacer size="xs" />
          <Text variant="body" tone="textSecondary">
            Here's your money this month
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          hitSlop={8}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Image
            source={PROFILE_IMAGE}
            style={{
              width: 60,
              height: 60,
              borderRadius: theme.radius.pill,
              borderWidth: 2,
              borderColor: theme.colors.card,
            }}
            contentFit="cover"
            transition={200}
          />
        </Pressable>
      </View>

      {/* Balance hero */}
      <Card variant="floating" padding="lg" style={{ backgroundColor: theme.colors.primary }}>
        <Text variant="caption" tone="textOnPrimary" style={{ opacity: 0.85 }}>
          Total balance
        </Text>
        <Spacer size="xs" />
        <Text variant="display" tone="textOnPrimary">
          $4,200.00
        </Text>
      </Card>

      <Spacer size="lg" />

      {/* Budget */}
      <Card>
        <Text variant="caption" tone="textSecondary">
          November budget
        </Text>
        <Spacer size="xs" />
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text variant="heading">$1,284.5</Text>
          <Text variant="body" tone="textSecondary">
            {' '}
            / $2,400
          </Text>
        </View>
        <Spacer size="md" />
        {/* Progress bar — purely decorative for now */}
        <View
          style={{
            height: 8,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: '54%',
              height: '100%',
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.pill,
            }}
          />
        </View>
        <Spacer size="sm" />
        <Text variant="caption" tone="textSecondary">
          You can spend $1,116 more this month 🌿
        </Text>
      </Card>

      <Spacer size="xl" />

      {/* Categories */}
      <SectionHeader title="Categories" actionLabel="See all" />
      <Spacer size="md" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {DEFAULT_CATEGORIES.map((c) => (
          <View key={c.id} style={{ alignItems: 'center', flex: 1 }}>
            <IconBubble tone={c.tone} icon={c.icon} />
            <Spacer size="sm" />
            <Text variant="caption" tone="textSecondary">
              {c.label}
            </Text>
          </View>
        ))}
      </View>

      <Spacer size="xl" />

      {/* Recent activity */}
      <SectionHeader title="Recent activity" actionLabel="View all" />
      <Spacer size="md" />
      <Card padding="none">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              borderBottomWidth: i === 3 ? 0 : 1,
              borderBottomColor: theme.colors.border,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.background,
              }}
            />
            <Spacer size="md" horizontal />
            <View style={{ flex: 1 }}>
              <View
                style={{
                  width: '50%',
                  height: 10,
                  borderRadius: 4,
                  backgroundColor: theme.colors.border,
                }}
              />
              <Spacer size="xs" />
              <View
                style={{
                  width: '30%',
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.colors.border,
                  opacity: 0.6,
                }}
              />
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
