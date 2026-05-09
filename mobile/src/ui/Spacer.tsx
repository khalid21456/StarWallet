import React from 'react';
import { View } from 'react-native';

import { spacing, type SpacingKey } from '@/src/theme/spacing';

type SpacerProps = {
  size?: SpacingKey;
  horizontal?: boolean;
};

/**
 * Layout helper for vertical (default) or horizontal gaps. Prefer this
 * over scattered margin styles when a parent already drives layout.
 */
export function Spacer({ size = 'md', horizontal = false }: SpacerProps) {
  const value = spacing[size];
  return <View style={horizontal ? { width: value } : { height: value }} />;
}
