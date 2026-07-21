import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Budget, Categorie, Transaction } from '@/src/classes';
import { getCategoryVisual } from '@/src/constants/categories';
import { useTheme } from '@/src/hooks/use-theme';
import { getBalance } from '@/src/services/BalanceService';
import { getActiveBudgets, getBudgetSpending } from '@/src/services/BudgetService';
import { getAllCategories } from '@/src/services/CategorieService';
import { getAllTransactions } from '@/src/services/TransactionService';
import { Card, IconBubble, Screen, SectionHeader, Spacer, Text } from '@/src/ui';
import {
  formatCurrency,
  formatDate,
  formatSignedAmount,
  monthLabel,
  percentWidth,
} from '@/src/utils/format';
import { getTransactionLabel, getTransactionVisual } from '@/src/utils/transactions';

// Bundled via Metro's static-asset resolver — `require` is the
// correct API for local images (URI strings only work for remotes).
const PROFILE_IMAGE = require('../../assets/images/profile.png');

type BudgetSummary = { limit: number; spent: number };

function summarizeBudgets(budgets: Budget[]): BudgetSummary {
  return budgets.reduce<BudgetSummary>(
    (acc, b) => ({
      limit: acc.limit + b.amountLimit,
      spent: acc.spent + getBudgetSpending(b.id),
    }),
    { limit: 0, spent: 0 },
  );
}

/**
 * Home — live overview backed by SQLite: total balance, current-month budget
 * progress, category shortcuts and the most recent transactions. Reloads every
 * time the tab regains focus so newly added transactions appear immediately.
 */
export default function HomeScreen() {
  const theme = useTheme();

  const [balance, setBalance] = useState(0);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<BudgetSummary>({ limit: 0, spent: 0 });

  const load = useCallback(() => {
    setBalance(getBalance().balance);
    setCategories(getAllCategories());
    setRecent(getAllTransactions().slice(0, 4));
    setBudget(summarizeBudgets(getActiveBudgets(new Date().toISOString())));
  }, []);

  useFocusEffect(load);

  const categoryNames = new Map(categories.map((c) => [c.id, c.name] as const));
  const remaining = budget.limit - budget.spent;
  const progress = budget.limit > 0 ? Math.min(budget.spent / budget.limit, 1) : 0;

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
          <Text variant="heading" style={{fontSize:20}}>Welcome back Najma</Text>
          <Spacer size="sm" />
          <Text variant="body" tone="textSecondary">
            {"Here's your money this month"}
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
          {formatCurrency(balance)}
        </Text>
      </Card>

      {/* <Spacer size="sm" /> */}

      {/* Budget */}
      {/* <Card>
        <Text variant="caption" tone="textSecondary">
          {monthLabel(new Date())} budget
        </Text>
        <Spacer size="xs" />
        {budget.limit > 0 ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text variant="heading">{formatCurrency(budget.spent)}</Text>
              <Text variant="body" tone="textSecondary">
                {' '}
                / {formatCurrency(budget.limit)}
              </Text>
            </View>
            <Spacer size="md" />
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
                  width: percentWidth(progress),
                  height: '100%',
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.pill,
                }}
              />
            </View>
            <Spacer size="sm" />
            <Text variant="caption" tone="textSecondary">
              {remaining >= 0
                ? `You can spend ${formatCurrency(remaining)} more this month 🌿`
                : `You are ${formatCurrency(-remaining)} over budget`}
            </Text>
          </>
        ) : (
          <Text variant="body" tone="textSecondary">
            No active budget this month.
          </Text>
        )}
      </Card> */}

      <Spacer size="xl" />

      {/* Categories */}
      <SectionHeader title="Categories" actionLabel="See all" onAction={() => router.navigate('/stats')} />
      <Spacer size="md" />
      {categories.length === 0 ? (
        <Text variant="body" tone="textSecondary">
          No categories yet.
        </Text>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {categories.slice(0, 4).map((c) => {
            const visual = getCategoryVisual(c.name);
            return (
              <View key={c.id} style={{ alignItems: 'center', flex: 1 }}>
                <IconBubble tone={visual.tone} icon={visual.icon} />
                <Spacer size="sm" />
                <Text variant="caption" tone="textSecondary" numberOfLines={1}>
                  {c.name}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <Spacer size="xl" />

      {/* Recent activity */}
      <SectionHeader title="Recent activity" actionLabel="View all" onAction={() => router.navigate('/activity')} />
      <Spacer size="md" />
      <Card padding="none">
        {recent.length === 0 ? (
          <View style={{ padding: theme.spacing.lg }}>
            <Text variant="body" tone="textSecondary">
              No transactions yet. Tap + to add one.
            </Text>
          </View>
        ) : (
          recent.map((t, i) => {
            const name = getTransactionLabel(t, categoryNames);
            const visual = getTransactionVisual(t, categoryNames);
            return (
              <View
                key={t.id}
                style={{
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  borderBottomWidth: i === recent.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <IconBubble tone={visual.tone} icon={visual.icon} size={36} />
                <Spacer size="md" horizontal />
                <View style={{ flex: 1 }}>
                  <Text variant="body">{name}</Text>
                  <Text variant="caption" tone="textSecondary">
                    {formatDate(t.createdAt)}
                  </Text>
                </View>
                <Text variant="body" tone={t.type === 'income' ? 'success' : 'textPrimary'}>
                  {formatSignedAmount(t.amount, t.type)}
                </Text>
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}
