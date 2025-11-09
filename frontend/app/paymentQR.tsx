import { StyleSheet, View, useColorScheme, Alert } from 'react-native'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React, { useState, useEffect } from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCart } from '@/context/CartContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import apiClient from '@/services/api'

const TIMER_DURATION = 120 // 120 seconds = 2 minutes
const SUCCESS_DELAY_MS = 10000 // Time before *attempting* payment
const REDIRECT_DELAY_MS = 2000 // Time to *show* success message before redirecting

const getDynamicStyles = (themeColors: (typeof Colors)['light']) => {
  return StyleSheet.create({
    safeAreaWrapper: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 18,
      color: themeColors.secondaryText,
      marginBottom: 10,
    },
    total: {
      lineHeight:50,
      fontSize: 48,
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 20,
    },
    qrCode: {
      width: 250,
      height: 250,
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    timerText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: themeColors.tint,
    },
    processingText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: themeColors.secondaryText,
      fontStyle: 'italic',
    },
    successText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#3CB371',
      textTransform: 'uppercase',
    },
    timeoutText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FF6347',
    },
    scanText: {
      fontSize: 16,
      color: themeColors.secondaryText,
      marginTop: 20,
      textAlign: 'center',
    },
  })
}

export default function PaymentQRScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)

  const router = useRouter()
  const { clearCart } = useCart()
  const { total, paymentType } = useLocalSearchParams<{
    total: string
    paymentType: string
  }>()

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isSuccess || isProcessing) {
      return
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [isSuccess, isProcessing])

  useEffect(() => {
    if (secondsLeft > 0 || isSuccess || isProcessing) {
      return
    }
    Alert.alert(
      'Payment Timed Out',
      'Your session has expired. Please try again.',
      [{ text: 'OK', onPress: () => router.back() }]
    )
  }, [secondsLeft, isSuccess, isProcessing, router])

  useEffect(() => {
    const successTimer = setTimeout(async () => {
      if (!total) {
        Alert.alert('Error', 'Total amount is missing.', [
          { text: 'OK', onPress: () => router.back() },
        ])
        return
      }

      setIsProcessing(true)

      try {
        await apiClient.post('/wallets/me/generic-spend/', {
          amount: total,
        })

        setIsSuccess(true)
      } catch (err: any) {
        console.error('Payment failed:', err)
        let errorMessage = 'Your payment could not be completed.'
        if (err.response && err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail
        }

        Alert.alert('Payment Failed', errorMessage, [
          { text: 'OK', onPress: () => router.back() },
        ])
      } finally {
        setIsProcessing(false)
      }
    }, SUCCESS_DELAY_MS)

    return () => clearTimeout(successTimer)
  }, [total, router])

  useEffect(() => {
    if (!isSuccess) {
      return
    }

    clearCart()

    const redirectTimer = setTimeout(() => {
      router.replace('/(tabs)')
    }, REDIRECT_DELAY_MS)

    return () => clearTimeout(redirectTimer)
  }, [isSuccess, clearCart, router])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const qrUrl = `https://docs.lightburnsoftware.com/legacy/img/QRCode/ExampleCode.png`

  const getStatusText = () => {
    if (isSuccess) {
      return 'Success'
    }
    if (isProcessing) {
      return 'Processing...'
    }
    if (secondsLeft > 0) {
      return formatTime(secondsLeft)
    }
    return 'Timed Out'
  }

  const getStatusStyle = () => {
    if (isSuccess) {
      return styles.successText
    }
    if (isProcessing) {
      return styles.processingText
    }
    if (secondsLeft > 0) {
      return styles.timerText
    }
    return styles.timeoutText
  }

  const getIconColor = () => {
    if (isSuccess) {
      return '#3CB371'
    }
    if (isProcessing) {
      return themeColors.secondaryText
    }
    if (secondsLeft > 0) {
      return themeColors.tint
    }
    return '#FF6347'
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Scan to Pay' }} />
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>You are paying</ThemedText>
        <ThemedText style={styles.total}>฿ {total}</ThemedText>

        <Image source={{ uri: qrUrl }} style={styles.qrCode} />

        <View style={styles.timerContainer}>
          <Ionicons name="timer-outline" size={24} color={getIconColor()} />
          <ThemedText style={getStatusStyle()}>{getStatusText()}</ThemedText>
        </View>

        <ThemedText style={styles.scanText}>
          Ask the merchant to scan this QR code to complete your payment.
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  )
}
