import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { getCategoryVisual } from '@/src/constants/categories';
import { useTheme } from '@/src/hooks/use-theme';
import { getAllCategories } from '@/src/services/CategorieService';
import { getTransactionsBetween } from '@/src/services/TransactionService';
import { Card, Screen, Spacer, Text } from '@/src/ui';
import { formatCurrency, percentWidth } from '@/src/utils/format';

type CategoryTotal = { id: number; name: string; total: number };

function currentMonthRangeISO(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Stats — this-month spending backed by SQLite. Totals expenses vs income and
 * shows a per-category breakdown with proportional bars (chart-kit-free).
 */
export default function StatsScreen() {
  const theme = useTheme();

  const [spent, setSpent] = useState(0);
  const [earned, setEarned] = useState(0);
  const [byCategory, setByCategory] = useState<CategoryTotal[]>([]);

  const load = useCallback(() => {
    const { start, end } = currentMonthRangeISO();
    const monthTx = getTransactionsBetween(start, end);
    const names = new Map(getAllCategories().map((c) => [c.id, c.name] as const));

    let expenseTotal = 0;
    let incomeTotal = 0;
    const perCategory = new Map<number, number>();

    for (const t of monthTx) {
      if (t.type === 'income') {
        incomeTotal += t.amount;
      } else {
        expenseTotal += t.amount;
        if (t.categorieId !== null) {
          perCategory.set(t.categorieId, (perCategory.get(t.categorieId) ?? 0) + t.amount);
        }
      }
    }

    const totals: CategoryTotal[] = [...perCategory.entries()]
      .map(([id, total]) => ({ id, name: names.get(id) ?? 'Uncategorized', total }))
      .sort((a, b) => b.total - a.total);

    setSpent(expenseTotal);
    setEarned(incomeTotal);
    setByCategory(totals);
  }, []);

  useFocusEffect(load);

  const maxTotal = byCategory.reduce((m, c) => Math.max(m, c.total), 0);

  return (
    <Screen title="Stats" subtitle="Your spending at a glance">
      <Card>
        <Text variant="caption" tone="textSecondary">
          Spending this month
        </Text>
        <Spacer size="xs" />
        <Text variant="display" tone="danger">
          {formatCurrency(spent)}
        </Text>
        <Spacer size="sm" />
        <Text variant="caption" tone="textSecondary">
          Income this month: {formatCurrency(earned)}
        </Text>
      </Card>

      <Spacer size="lg" />

      <Card>
        <Text variant="caption" tone="textSecondary">
          By category
        </Text>
        <Spacer size="md" />
        {byCategory.length === 0 ? (
          <Text variant="body" tone="textSecondary">
            No spending recorded this month yet.
          </Text>
        ) : (
          byCategory.map((c, i) => {
            const visual = getCategoryVisual(c.name);
            const width = maxTotal > 0 ? Math.max(c.total / maxTotal, 0.04) : 0;
            return (
              <View key={c.id} style={{ marginTop: i === 0 ? 0 : theme.spacing.md }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  <Text variant="body">{c.name}</Text>
                  <Text variant="body">
                    {formatCurrency(c.total)}
                  </Text>
                </View>
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
                      backgroundColor: theme.colors[visual.tone],
                    }}
                  />
                </View>
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}
