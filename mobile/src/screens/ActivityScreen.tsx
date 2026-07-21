import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Categorie, Transaction } from '@/src/classes';
import { useTheme } from '@/src/hooks/use-theme';
import { getAllCategories } from '@/src/services/CategorieService';
import { getAllTransactions } from '@/src/services/TransactionService';
import { Card, IconBubble, Screen, SectionHeader, Spacer, Text } from '@/src/ui';
import { formatDate, formatSignedAmount } from '@/src/utils/format';
import { getTransactionLabel, getTransactionVisual } from '@/src/utils/transactions';


export default function ActivityScreen() {
  const theme = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);

  const load = useCallback(() => {
    setTransactions(getAllTransactions());
    setCategories(getAllCategories());
  }, []);

  useFocusEffect(load);

  const categoryNames = new Map(categories.map((c) => [c.id, c.name] as const));

  return (
    <Screen title="Activity" subtitle="All your recent transactions">
      <SectionHeader title={`${transactions.length} transactions`} />
      <Spacer size="md" />
      <Card padding="none">
        {transactions.length === 0 ? (
          <View style={{ padding: theme.spacing.lg }}>
            <Text variant="body" tone="textSecondary">
              Nothing here yet. Add your first transaction with the + button.
            </Text>
          </View>
        ) : (
          transactions.map((t, i) => {
            const name = getTransactionLabel(t, categoryNames);
            const visual = getTransactionVisual(t, categoryNames);
            return (
              <View
                key={t.id}
                style={{
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  borderBottomWidth: i === transactions.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <IconBubble tone={visual.tone} icon={visual.icon} size={40} />
                <Spacer size="md" horizontal />
                <View style={{ flex: 1 }}>
                  <Text variant="body">{name}</Text>
                  <Text variant="caption" tone="textSecondary" style={{fontSize:10}}>
                    {t.type === 'income' ? 'Income' : 'Expense'} · {formatDate(t.createdAt)}
                  </Text>
                </View>
                <Text
                  variant="body"
                  tone={t.type === 'income' ? 'success' : 'textPrimary'}
                >
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
