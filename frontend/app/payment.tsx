import {
  StyleSheet,
  View,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React, { useMemo, useState, useEffect } from 'react'
import { Stack, useLocalSearchParams, Redirect, useRouter } from 'expo-router'
import { useCart } from '@/context/CartContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import apiClient from '@/services/api'

interface WalletSummary {
  available: string
  total: string
  currency: string
}

const getDynamicStyles = (themeColors: (typeof Colors)['light']) => {
  return StyleSheet.create({
    safeAreaWrapper: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    container: {
      flex: 1,
    },
    content: {
      alignItems: 'center',
      padding: 20,
    },
    label: {
      fontSize: 16,
      color: themeColors.secondaryText,
    },
    totalAmount: {
      lineHeight:55,
      fontSize: 52,
      fontWeight: 'bold',
      color: themeColors.text,
      marginVertical: 10,
    },
    credit: {
      fontSize: 14,
      color: themeColors.secondaryText,
      marginBottom: 20,
      height: 20, // Added height for loading indicator stability
    },
    payButton: {
      width: '100%',
      backgroundColor: themeColors.tint,
      padding: 15,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    payButtonText: {
      color: themeColors.tintForeground,
      fontSize: 18,
      fontWeight: 'bold',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginVertical: 10,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: themeColors.borderColor,
    },
    dividerText: {
      marginHorizontal: 15,
      color: themeColors.secondaryText,
    },
    installmentGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
    },
    installmentButton: {
      width: '48%',
      backgroundColor: themeColors.componentBackground,
      padding: 20,
      borderRadius: 15,
      marginBottom: 15,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.borderColor,
    },
    installmentMonth: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    installmentAmount: {
      fontSize: 14,
      color: themeColors.secondaryText,
      marginTop: 3,
    },
  })
}

export default function PaymentScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)

  const { total } = useLocalSearchParams<{ total: string }>()
  const totalAmount = parseFloat(total)

  const router = useRouter()
  const { clearCart } = useCart()

  const [wallet, setWallet] = useState<WalletSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWalletSummary = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get<WalletSummary>(
          '/wallets/me/summary/'
        )
        setWallet(response.data)
      } catch (error) {
        console.error('Failed to fetch wallet summary:', error)
        Alert.alert('Error', 'Could not load your credit information.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletSummary()
  }, [])

  if (!totalAmount) {
    return <Redirect href="/(tabs)" />
  }

  const installments = useMemo(() => {
    return [1, 2, 3, 5, 6, 12].map((months) => ({
      months,
      amount: totalAmount / months,
    }))
  }, [totalAmount])

  const handlePayment = (paymentType: string) => {
    router.push({
      pathname: '/paymentQR',
      params: { total: totalAmount.toFixed(2), paymentType },
    })
  }

  const renderAvailableCredit = () => {
    if (isLoading) {
      return (
        <ActivityIndicator size="small" color={themeColors.secondaryText} />
      )
    }
    if (wallet) {
      const availableAmount = parseFloat(wallet.available)
      return `Available Credit: ${
        wallet.currency
      } ${availableAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }
    return 'Could not load credit'
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Payment' }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <ThemedText style={styles.label}>Total Amount</ThemedText>
          <ThemedText style={styles.totalAmount}>
            ฿ {totalAmount.toFixed(2)}
          </ThemedText>
          <ThemedText style={styles.credit}>
            {renderAvailableCredit()}
          </ThemedText>

          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handlePayment('Pay Now')}
          >
            <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>Or Pay Later</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.installmentGrid}>
            {installments.map((item) => (
              <TouchableOpacity
                key={item.months}
                style={styles.installmentButton}
                onPress={() =>
                  handlePayment(
                    `${item.months} month${item.months > 1 ? 's' : ''}`
                  )
                }
              >
                <ThemedText style={styles.installmentMonth}>
                  {item.months} month{item.months > 1 ? 's' : ''}
                </ThemedText>
                <ThemedText style={styles.installmentAmount}>
                  (฿ {item.amount.toFixed(2)}/month)
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
