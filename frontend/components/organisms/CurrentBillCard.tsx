import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import { homeBills } from '@/data/homeData'

// Get Bill type from homeBills export
type Bill = (typeof homeBills)[0]
type FormatCurrencyFunc = (amount: number) => string

export const CurrentBillCard = ({
  bill,
  onPay,
  formatCurrency,
}: {
  bill: Bill
  onPay: () => void
  formatCurrency: FormatCurrencyFunc
}) => {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getStyles(themeColors)

  return (
    <View style={styles.currentBillCard}>
      <View style={styles.currentBillHeader}>
        <ThemedText style={styles.currentBillLabel}>{bill.title}</ThemedText>
        <ThemedText style={styles.currentBillDate}>{bill.date}</ThemedText>
      </View>
      <ThemedText style={styles.currentBillAmount}>
        {formatCurrency(bill.amount)}
      </ThemedText>
      <TouchableOpacity style={styles.payButton} onPress={onPay}>
        <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
      </TouchableOpacity>
    </View>
  )
}

const getStyles = (themeColors: (typeof Colors)['light']) =>
  StyleSheet.create({
    currentBillCard: {
      marginHorizontal: 20,
      padding: 20,
      backgroundColor: themeColors.componentBackground,
      borderRadius: 15,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    currentBillHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    currentBillLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
    },
    currentBillDate: {
      fontSize: 12,
      color: themeColors.secondaryText,
    },
    currentBillAmount: {
      fontSize: 42,
      fontWeight: 'bold',
      color: themeColors.text,
      marginVertical: 15,
      textAlign: 'center',
    },
    payButton: {
      backgroundColor: themeColors.tint,
      padding: 15,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    payButtonText: {
      color: themeColors.tintForeground,
      fontSize: 18,
      fontWeight: 'bold',
    },
  })
