import React, { type ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/src/hooks/use-theme';

import { Spacer } from './Spacer';
import { Text } from './Text';

/**
 * Reserved space at the bottom of every scrollable screen so content
 * never sits underneath the floating tab bar. Keep this in sync with
 * FloatingTabBar's height + bottom inset.
 */
export const TAB_BAR_CLEARANCE = 120;

type ScreenProps = {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  contentPadding?: boolean;
  scrollViewProps?: ScrollViewProps;
  children: ReactNode;
};

/**
 * Page-level container. Handles:
 *   - SafeAreaView (top edges only — bottom is handled by tab bar clearance)
 *   - background color from theme
 *   - optional title block
 *   - scroll vs static layout
 *   - consistent horizontal padding
 */
export function Screen({
  title,
  subtitle,
  scroll = true,
  contentPadding = true,
  scrollViewProps,
  children,
}: ScreenProps) {
  const theme = useTheme();

  const Body = (
    <View
      style={{
        paddingHorizontal: contentPadding ? theme.spacing.lg : 0,
        paddingTop: title ? theme.spacing.md : theme.spacing.sm,
        paddingBottom: scroll ? TAB_BAR_CLEARANCE : 0,
      }}
    >
      {title ? (
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="heading">{title}</Text>
          {subtitle ? (
            <>
              <Spacer size="xs" />
              <Text variant="body" tone="textSecondary">
                {subtitle}
              </Text>
            </>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          {...scrollViewProps}
        >
          {Body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{Body}</View>
      )}
    </SafeAreaView>
  );
}
