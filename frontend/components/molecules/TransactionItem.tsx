import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'

type Transaction = { title: string; date: string; amount: number }

export const TransactionItem = ({
  transaction,
  formatCurrency,
}: {
  transaction: Transaction
  formatCurrency: (amount: number) => string
}) => {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getStyles(themeColors)

  return (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <ThemedText style={styles.transactionTitle} numberOfLines={1}>
          {transaction.title}
        </ThemedText>
        {transaction.date !== 'TODAY' && (
          <ThemedText style={styles.transactionDate}>
            {transaction.date}
          </ThemedText>
        )}
      </View>
      <View style={styles.transactionRight}>
        <ThemedText style={styles.transactionAmount}>
          {formatCurrency(transaction.amount).replace('-', '')}
        </ThemedText>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={themeColors.secondaryText}
        />
      </View>
    </TouchableOpacity>
  )
}

const getStyles = (themeColors: (typeof Colors)['light']) =>
  StyleSheet.create({
    transactionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
    },
    transactionLeft: {
      flex: 1,
      marginRight: 10,
    },
    transactionTitle: {
      fontSize: 14,
      color: themeColors.text,
      fontWeight: '500',
      marginBottom: 2,
    },
    transactionDate: {
      fontSize: 12,
      color: themeColors.secondaryText,
    },
    transactionRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    transactionAmount: {
      fontSize: 14,
      color: themeColors.text,
      fontWeight: 'bold',
    },
  })
