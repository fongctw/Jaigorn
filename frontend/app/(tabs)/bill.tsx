import {
  StyleSheet,
  ScrollView,
  View,
  useColorScheme,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { homeBills, creditData } from '@/data/homeData'
import { billHistory } from '@/data/billHistory'
import { CurrentBillCard } from '@/components/organisms/CurrentBillCard'
import { BillHistoryItem } from '@/components/molecules/BillHistoryItem'

const formatCurrency = (amount: number) => {
  const currency = creditData.currency || '฿'
  return `${currency} ${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const getDynamicStyles = (themeColors: (typeof Colors)['light']) => {
  return StyleSheet.create({
    safeAreaWrapper: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'android' ? 25 : 10,
      paddingBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    // Bill History Header
    historyHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      color: themeColors.text,
      marginVertical: 20,
      paddingHorizontal: 20,
    },
  })
}

export default function BillScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)
  const router = useRouter()

  const currentBill = homeBills.find((bill) => bill.status === 'due')

  const handlePayNow = () => {
    if (!currentBill) return
    router.push({
      pathname: '/payment',
      params: { total: currentBill.amount.toFixed(2) },
    })
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper} edges={['top']}>
      <Stack.Screen options={{ title: 'Bills' }} />
      <ThemedView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Your Bills</ThemedText>
          </View>

          {currentBill ? (
            <CurrentBillCard
              bill={currentBill}
              onPay={handlePayNow}
              formatCurrency={formatCurrency}
            />
          ) : (
            <ThemedText
              style={{
                textAlign: 'center',
                padding: 20,
                color: themeColors.secondaryText,
              }}
            >
              No current bills due.
            </ThemedText>
          )}

          <ThemedText style={styles.historyHeader}>Bill History</ThemedText>
          {billHistory.map((item) => (
            <BillHistoryItem
              key={item.id}
              item={item}
              themeColors={themeColors}
              formatCurrency={formatCurrency}
            />
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}
