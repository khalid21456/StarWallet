import React from 'react';
import { View } from 'react-native';

import { Button, Card, Screen, Spacer, Text } from '@/src/ui';

/**
 * Add transaction — placeholder form fields styled as cards.
 * No state, no validation — wired up when the transactions feature lands.
 */
function Field({ label, hint }: { label: string; hint: string }) {
  return (
    <Card>
      <Text variant="caption" tone="textSecondary">
        {label}
      </Text>
      <Spacer size="xs" />
      <Text variant="subheading" tone="textPrimary" style={{ opacity: 0.4 }}>
        {hint}
      </Text>
    </Card>
  );
}

export default function AddTransactionScreen() {
  return (
    <Screen title="Add transaction" subtitle="Log a new expense or income">
      <Field label="Amount" hint="$0.00" />
      <Spacer size="md" />
      <Field label="Category" hint="Choose category" />
      <Spacer size="md" />
      <Field label="Note" hint="Add a note…" />
      <Spacer size="xl" />
      <View style={{ alignItems: 'stretch' }}>
        <Button label="Save transaction" size="lg" fullWidth />
        <Spacer size="sm" />
        <Button label="Cancel" variant="ghost" size="lg" fullWidth />
      </View>
    </Screen>
  );
}
