import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Budget } from '@/src/classes';
import { getCategoryVisual } from '@/src/constants/categories';
import { useTheme } from '@/src/hooks/use-theme';
import { createBudget, getActiveBudgetForCategorie, updateBudget } from '@/src/services/BudgetService';
import { getAllCategories } from '@/src/services/CategorieService';
import { getTransactionsBetween } from '@/src/services/TransactionService';
import { Card, Screen, Spacer, Text } from '@/src/ui';
import { formatCurrency, percentWidth } from '@/src/utils/format';

type CategoryStat = {
  id: number;
  name: string;
  spent: number;
  budget: Budget | null;
};

function currentMonthRangeISO(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Budget — set a monthly spending limit ("regle") per category. Tapping
 * "Set budget" / "Edit budget" opens an inline amount field; saving either
 * updates the category's active budget for the current month or creates one.
 */
export default function BudgetScreen() {
  const theme = useTheme();

  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [rowError, setRowError] = useState<string | null>(null);

  const load = useCallback(() => {
    const { start, end } = currentMonthRangeISO();
    const nowISO = new Date().toISOString();
    const monthTx = getTransactionsBetween(start, end);
    const categories = getAllCategories();

    const spentByCategorie = new Map<number, number>();
    for (const t of monthTx) {
      if (t.type === 'expense' && t.categorieId !== null) {
        spentByCategorie.set(t.categorieId, (spentByCategorie.get(t.categorieId) ?? 0) + t.amount);
      }
    }

    const newStats: CategoryStat[] = categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        spent: spentByCategorie.get(c.id) ?? 0,
        budget: getActiveBudgetForCategorie(c.id, nowISO),
      }))
      .sort((a, b) => b.spent - a.spent);

    setStats(newStats);
  }, []);

  useFocusEffect(load);

  function startEditing(stat: CategoryStat) {
    setEditingId(stat.id);
    setEditValue(stat.budget ? String(stat.budget.amountLimit) : '');
    setRowError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditValue('');
    setRowError(null);
  }

  function saveBudget(stat: CategoryStat) {
    const parsed = Number.parseFloat(editValue.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setRowError('Enter an amount greater than 0.');
      return;
    }
    if (stat.budget) {
      updateBudget(stat.budget.id, stat.id, parsed, stat.budget.startDate, stat.budget.endDate);
    } else {
      const { start, end } = currentMonthRangeISO();
      createBudget(stat.id, parsed, start, end);
    }
    cancelEditing();
    load();
  }

  return (
    <Screen title="Budget" subtitle="Set a monthly limit per category">
      <Card>
        {stats.length === 0 ? (
          <Text variant="body" tone="textSecondary">
            No categories yet.
          </Text>
        ) : (
          stats.map((stat, i) => {
            const visual = getCategoryVisual(stat.name);
            const limit = stat.budget?.amountLimit ?? 0;
            const width = limit > 0 ? Math.min(stat.spent / limit, 1) : 0;
            const isEditing = editingId === stat.id;
            const over = limit > 0 && stat.spent > limit;

            return (
              <View key={stat.id} style={{ marginTop: i === 0 ? 0 : theme.spacing.lg }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  <Text variant="body">{stat.name}</Text>
                  {stat.budget ? (
                    <Text variant="body" tone={over ? 'danger' : 'textSecondary'}>
                      {formatCurrency(stat.spent)} / {formatCurrency(limit)}
                    </Text>
                  ) : (
                    <Text variant="body" tone="textSecondary">
                      {formatCurrency(stat.spent)}
                    </Text>
                  )}
                </View>

                {stat.budget ? (
                  <View
                    style={{
                      height: 10,
                      borderRadius: theme.radius.pill,
                      backgroundColor: theme.colors.border,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: percentWidth(width),
                        height: '100%',
                        borderRadius: theme.radius.pill,
                        backgroundColor: over ? theme.colors.danger : theme.colors[visual.tone],
                      }}
                    />
                  </View>
                ) : null}

                <Spacer size="sm" />

                {isEditing ? (
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                      <View
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                          borderRadius: theme.radius.md,
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: theme.spacing.sm,
                        }}
                      >
                        <TextInput
                          value={editValue}
                          onChangeText={(v) => {
                            setEditValue(v);
                            if (rowError) setRowError(null);
                          }}
                          placeholder="0.00 MAD"
                          placeholderTextColor={theme.colors.textSecondary}
                          keyboardType="decimal-pad"
                          autoFocus
                          style={[theme.typography.body, { color: theme.colors.textPrimary, padding: 0 }]}
                        />
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => saveBudget(stat)}
                        style={{
                          height: 40,
                          paddingHorizontal: theme.spacing.md,
                          borderRadius: theme.radius.pill,
                          backgroundColor: theme.colors.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text variant="caption" tone="textOnPrimary">
                          Save
                        </Text>
                      </Pressable>
                      <Pressable accessibilityRole="button" onPress={cancelEditing} hitSlop={8}>
                        <Text variant="caption" tone="textSecondary">
                          Cancel
                        </Text>
                      </Pressable>
                    </View>
                    {rowError ? (
                      <>
                        <Spacer size="xs" />
                        <Text variant="caption" tone="danger">
                          {rowError}
                        </Text>
                      </>
                    ) : null}
                  </View>
                ) : (
                  <Pressable accessibilityRole="button" onPress={() => startEditing(stat)} hitSlop={4}>
                    <Text variant="caption" tone="primary">
                      {stat.budget ? 'Edit budget' : 'Set budget'}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}
