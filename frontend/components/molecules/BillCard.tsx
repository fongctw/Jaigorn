import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'

type Bill = { title: string; date: string; amount: number; status: string }

export const BillCard = ({
  bill,
  formatCurrency,
  index
}: {
  bill: Bill
  formatCurrency: (amount: number) => string
  index: number
}) => {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getStyles(themeColors)

  return (
    <View style={styles.billCard}>
      <View style={styles.billCardContent}>
        <ThemedText style={styles.billCardTitle}>{index == 0 ? 'Upcoming Bill' : index == 1 ? "December's Bill" : "January's Bill"}</ThemedText>
        <ThemedText style={styles.billCardAmount}>
          {formatCurrency(bill.amount)}
        </ThemedText>
      </View>
      <View style={styles.billCardFooter}>
        <ThemedText style={styles.billCardDays}>{bill.date}</ThemedText>
        {bill.status === 'due' && (
          <TouchableOpacity style={styles.billCardPayButton}>
            <ThemedText style={styles.billCardPayButtonText}>Pay</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const getStyles = (themeColors: (typeof Colors)['light']) =>
  StyleSheet.create({
    billCard: {
      backgroundColor: themeColors.componentBackground,
      borderRadius: 15,
      padding: 15,
      marginRight: 15,
      width: 220,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      minHeight: 110,
    },
    billCardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    billCardTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: themeColors.text,
      flex: 1,
    },
    billCardAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    billCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 15,
    },
    billCardDays: {
      fontSize: 12,
      color: themeColors.icon,
    },
    billCardPayButton: {
      backgroundColor: themeColors.tint,
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 20,
    },
    billCardPayButtonText: {
      color: themeColors.tintForeground,
      fontSize: 12,
      fontWeight: 'bold',
    },
  })
