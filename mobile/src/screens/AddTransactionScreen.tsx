import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { getCategoryVisual } from '@/src/constants/categories';
import { useTheme } from '@/src/hooks/use-theme';
import { Button, Card, IconBubble, Screen, Spacer, Text } from '@/src/ui';
import { Categorie } from '@/src/classes';
import type { TransactionType } from '@/src/classes';
import { getAllCategories } from '@/src/services/CategorieService';
import { createTransaction } from '@/src/services/TransactionService';

const TYPES: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

/**
 * Add transaction — a working form. Picks amount, type and (for expenses only)
 * category, then persists via TransactionService (which also updates the
 * balance and auto-links the active budget "regle"), and returns to Home.
 * Income has no category relationship (it's salary), so the picker is
 * disabled and cleared whenever Income is selected.
 */
export default function AddTransactionScreen() {
  const theme = useTheme();

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categorieId, setCategorieId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isIncome = type === 'income';

  const load = useCallback(() => {
    setCategories(getAllCategories());
  }, []);

  // Load categories whenever the tab gains focus (and reset stale selection).
  useEffect(() => {
    load();
  }, [load]);

  // Income has no category — clear any selection made while on Expense.
  useEffect(() => {
    if (isIncome) setCategorieId(null);
  }, [isIncome]);

  function resetForm() {
    setAmount('');
    setType('expense');
    setCategorieId(null);
    setError(null);
  }

  function onSave() {
    const parsed = Number.parseFloat(amount.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    if (!isIncome && categorieId === null) {
      setError('Pick a category.');
      return;
    }
    createTransaction(parsed, type, isIncome ? null : categorieId);
    resetForm();
    router.navigate('/');
  }

  return (
    <Screen title="Add transaction" subtitle="Log a new expense or income">
      {/* Amount */}
      <Card>
        <Text variant="caption" tone="textSecondary">
          Amount
        </Text>
        <Spacer size="xs" />
        <TextInput
          value={amount}
          onChangeText={(t) => {
            setAmount(t);
            if (error) setError(null);
          }}
          placeholder="0.00 MAD"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="decimal-pad"
          style={[theme.typography.subheading, { color: theme.colors.textPrimary, padding: 0 }]}
        />
      </Card>

      <Spacer size="md" />

      {/* Type toggle */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {TYPES.map((t) => {
          const selected = type === t.value;
          return (
            <Pressable
              key={t.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setType(t.value)}
              style={{
                flex: 1,
                height: 48,
                borderRadius: theme.radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? theme.colors.primary : theme.colors.card,
                borderWidth: 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
              }}
            >
              <Text variant="body" tone={selected ? 'textOnPrimary' : 'textSecondary'}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Spacer size="md" />

      {/* Category picker — disabled for income, which has no category */}
      <Card style={isIncome ? { opacity: 0.4 } : undefined}>
        <View pointerEvents={isIncome ? 'none' : 'auto'}>
          <Text variant="caption" tone="textSecondary">
            Category
          </Text>
          <Spacer size="md" />
          {isIncome ? (
            <Text variant="body" tone="textSecondary">
            </Text>
          ) : categories.length === 0 ? (
            <Text variant="body" tone="textSecondary">
              No categories yet.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.spacing.lg, paddingRight: theme.spacing.sm }}
            >
              {categories.map((c) => {
                const visual = getCategoryVisual(c.name);
                const selected = categorieId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setCategorieId(c.id);
                      if (error) setError(null);
                    }}
                    style={{ alignItems: 'center', width: 68 }}
                  >
                    <View
                      style={{
                        borderRadius: theme.radius.pill,
                        borderWidth: 2,
                        borderColor: selected ? theme.colors.primary : 'transparent',
                        padding: 2,
                      }}
                    >
                      <IconBubble tone={visual.tone} icon={visual.icon} />
                    </View>
                    <Spacer size="xs" />
                    <Text
                      variant="caption"
                      tone={selected ? 'primary' : 'textSecondary'}
                      numberOfLines={1}
                      style={{fontSize:11}}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Card>

      {error ? (
        <>
          <Spacer size="md" />
          <Text variant="caption" tone="danger">
            {error}
          </Text>
        </>
      ) : null}

      <Spacer size="xl" />

      <View style={{ alignItems: 'stretch' }}>
        <Button label="Save transaction" size="lg" fullWidth onPress={onSave} />
        <Spacer size="sm" />
        <Button
          label="Cancel"
          variant="ghost"
          size="lg"
          fullWidth
          onPress={() => {
            resetForm();
            router.navigate('/');
          }}
        />
      </View>
    </Screen>
  );
}
