import {
  StyleSheet,
  SafeAreaView,
  SectionList,
  View,
  useColorScheme,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React, { useEffect, useState, useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import apiClient from '@/services/api'

export interface Transaction {
  id: string
  title: string
  date: string
  timestamp: string
  amount: string
  status: string
  category: string
  merchantName: string
  location: string
  referenceId: string
  currency: string
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
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: themeColors.text,
      fontSize: 16,
      textAlign: 'center',
      padding: 20,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'android' ? 25 : 10,
      paddingBottom: 10,
    },
    title: {
      lineHeight: 30,
      fontSize: 28,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    sectionHeader: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: themeColors.background,
    },
    sectionHeaderText: {
      fontSize: 12,
      color: themeColors.icon,
      textTransform: 'uppercase',
    },
    transactionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
      backgroundColor: themeColors.componentBackground,
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
}

const TransactionItem = ({
  item,
  styles,
  formatCurrency,
}: {
  item: Transaction
  styles: ReturnType<typeof getDynamicStyles>
  formatCurrency: (amount: number) => string
}) => (
  <Link href={`/transaction/${item.id}`} asChild>
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <ThemedText style={styles.transactionTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
      </View>
      <View style={styles.transactionRight}>
        <ThemedText style={styles.transactionAmount}>
          {formatCurrency(parseFloat(item.amount))}
        </ThemedText>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={Colors.light.secondaryText}
        />
      </View>
    </TouchableOpacity>
  </Link>
)

export default function TransactionScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currencySymbol, setCurrencySymbol] = useState('฿')

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.get<Transaction[]>(
          '/wallets/me/transactions/'
        )
        setTransactions(response.data)
        if (response.data.length > 0) {
          // const apiCurrency = response.data[0].currency
          // setCurrencySymbol(apiCurrency === 'B' ? '฿' : apiCurrency)
          const apiCurrency ='฿'
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err)
        setError('Could not load transactions.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const sections = useMemo(() => {
    const groupedTransactions = transactions.reduce((acc, tx) => {
      ;(acc[tx.date] = acc[tx.date] || []).push(tx)
      return acc
    }, {} as Record<string, Transaction[]>)

    return Object.keys(groupedTransactions).map((date) => ({
      title: date,
      data: groupedTransactions[date],
    }))
  }, [transactions])

  const formatCurrency = (amount: number) => {
    return `${currencySymbol} ${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaWrapper}>
        <ThemedView style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator size="large" color={themeColors.tint} />
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeAreaWrapper}>
        <ThemedView style={[styles.safeArea, styles.centered]}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper}>
      <ThemedView style={styles.safeArea}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText style={styles.title}>Transactions</ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <TransactionItem
              item={item}
              styles={styles}
              formatCurrency={formatCurrency}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionHeaderText}>{title}</ThemedText>
            </View>
          )}
          stickySectionHeadersEnabled={true}
          ListEmptyComponent={
            <View style={styles.centered}>
              <ThemedText>No transactions found.</ThemedText>
            </View>
          }
        />
      </ThemedView>
    </SafeAreaView>
  )
}
