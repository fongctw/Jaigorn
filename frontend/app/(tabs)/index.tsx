import {
  StyleSheet,
  ScrollView,
  Platform,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
  Text,
} from 'react-native'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'
import React, { useEffect, useState, useMemo } from 'react'
import apiClient from '@/services/api'
import { categories } from '@/data/homeData'
import { HomeHeader } from '@/components/organisms/HomeHeader'
import { CreditCard } from '@/components/organisms/CreditCard'
import { CategoryList } from '@/components/organisms/CategoryList'
import { BillList } from '@/components/organisms/BillList'
import { TransactionList } from '@/components/organisms/TransactionList'

interface User {
  name: string
  profileImageUrl: string
}

interface Wallet {
  available: number
  total: string
  currency: string
}

interface Bill {
  id: string
  title: string
  date: string
  amount: string
  status: string
}

interface Transaction {
  id: string
  title: string
  date: string
  amount: string
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
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'android' ? 30 : 10,
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
  })
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)

  const [user, setUser] = useState<User | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [bills, setBills] = useState<Bill[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  )
  const [currencySymbol, setCurrencySymbol] = useState('฿')

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [
          userResponse,
          walletResponse,
          billsResponse,
          transactionsResponse,
        ] = await Promise.all([
          apiClient.get<User>('/users/me/'),
          apiClient.get<Wallet>('/wallets/me/summary/'),
          apiClient.get<Bill[]>('/wallets/home/bills/'),
          apiClient.get<Transaction[]>('/wallets/me/transactions/'),
        ])

        setUser(userResponse.data)
        setWallet(walletResponse.data)
        setBills(billsResponse.data)
        setRecentTransactions(transactionsResponse.data)

        const apiCurrency = walletResponse.data.currency
        setCurrencySymbol(apiCurrency === 'B' ? '฿' : apiCurrency)
      } catch (err) {
        console.error('Failed to fetch home screen data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return `${currencySymbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formattedBills = useMemo(() => {
    return bills.map((bill) => ({
      ...bill,
      amount: parseFloat(bill.amount),
    }))
  }, [bills])

  const formattedTransactions = useMemo(() => {
    return recentTransactions.map((tx) => ({
      ...tx,
      amount: -parseFloat(tx.amount),
    }))
  }, [recentTransactions])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaWrapper}>
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" color={themeColors.tint} />
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (error || !user || !wallet) {
    return (
      <SafeAreaView style={styles.safeAreaWrapper}>
        <ThemedView style={styles.centered}>
          <Text style={styles.errorText}>
            {error || 'Could not load user data.'}
          </Text>
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper}>
      <ThemedView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <HomeHeader name={user.name} profileImageUrl={user.profileImageUrl} />

          <CreditCard
            available={wallet.available}
            total={parseFloat(wallet.total)}
            currency={currencySymbol}
          />

          <CategoryList categories={categories} />

          <BillList bills={formattedBills} formatCurrency={formatCurrency} />

          <TransactionList
            transactions={formattedTransactions}
            formatCurrency={formatCurrency}
          />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}
