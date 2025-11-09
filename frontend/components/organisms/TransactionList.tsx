import React from 'react'
import { View, StyleSheet, useColorScheme } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { SectionHeader } from '@/components/molecules/SectionHeader'
import { TransactionItem } from '../molecules/TransactionItem'
import { Colors } from '@/constants/theme'

type Transaction = { id: string; title: string; date: string; amount: number }

export const TransactionList = ({
  transactions,
  formatCurrency,
}: {
  transactions: Transaction[]
  formatCurrency: (amount: number) => string
}) => {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getStyles(themeColors)
  const hasTransactions = transactions && transactions.length > 0

  return (
    <View style={[styles.sectionContainer, { paddingBottom: 30 }]}>
      <SectionHeader title="Transactions" />

      {!hasTransactions ? (
        <ThemedText style={styles.noTransactionsText}>
          No recent transactions.
        </ThemedText>
      ) : (
        <>
          <ThemedText style={styles.transactionDateHeader}>
            {transactions[0].date}
          </ThemedText>
          {transactions.map((tx) => (
            <React.Fragment key={tx.id}>
              <TransactionItem
                transaction={tx}
                formatCurrency={formatCurrency}
              />
            </React.Fragment>
          ))}
        </>
      )}
    </View>
  )
}

const getStyles = (themeColors: (typeof Colors)['light']) =>
  StyleSheet.create({
    sectionContainer: {
      marginBottom: 20,
    },
    transactionDateHeader: {
      fontSize: 12,
      color: themeColors.icon,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    noTransactionsText: {
      fontSize: 14,
      color: themeColors.icon,
      marginTop: 10,
      textAlign: 'center',
    },
  })
