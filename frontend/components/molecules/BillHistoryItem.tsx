import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { BillHistoryItem as BillHistoryItemType } from '@/data/billHistory'

type FormatCurrencyFunc = (amount: number) => string

export const BillHistoryItem = ({
  item,
  themeColors,
  formatCurrency,
}: {
  item: BillHistoryItemType
  themeColors: (typeof Colors)['light']
  formatCurrency: FormatCurrencyFunc
}) => {
  const styles = getStyles(themeColors)

  return (
    <TouchableOpacity style={styles.historyItem}>
      <View style={styles.historyItemLeft}>
        <View style={styles.historyItemIcon}>
          <Ionicons name="receipt-outline" size={20} color={themeColors.icon} />
        </View>
        <View style={styles.historyItemInfo}>
          <ThemedText style={styles.historyItemTitle}>{item.month}</ThemedText>
          <ThemedText
            style={[
              styles.historyItemStatus,
              item.status === 'Paid' && styles.historyItemStatusPaid,
            ]}
          >
            {item.status}
          </ThemedText>
        </View>
      </View>
      <View style={styles.historyItemRight}>
        <ThemedText style={styles.historyItemAmount}>
          {formatCurrency(item.amount)}
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
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: themeColors.componentBackground,

      marginHorizontal: 20,
      marginBottom: 10,
      borderRadius: 15,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    historyItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    historyItemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: themeColors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    historyItemInfo: {
      flex: 1,
    },
    historyItemTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: themeColors.text,
    },
    historyItemStatus: {
      fontSize: 12,
      color: themeColors.secondaryText,
    },
    historyItemStatusPaid: {
      color: themeColors.tint,
      fontWeight: '500',
    },
    historyItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    historyItemAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text,
    },
  })
