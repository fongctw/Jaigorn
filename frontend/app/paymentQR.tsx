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

const TIMER_DURATION = 120 // 120 seconds = 2 minutes
const SUCCESS_DELAY_MS = 10000 // show success + redirect after 10 seconds

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

  useEffect(() => {
    if (isSuccess) {
      return
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [isSuccess])

  useEffect(() => {
    if (secondsLeft > 0 || isSuccess) {
      return
    }
    Alert.alert(
      'Payment Timed Out',
      'Your session has expired. Please try again.',
      [{ text: 'OK', onPress: () => router.back() }]
    )
  }, [secondsLeft, isSuccess, router])

  useEffect(() => {
    const successTimer = setTimeout(() => setIsSuccess(true), SUCCESS_DELAY_MS)
    return () => clearTimeout(successTimer)
  }, [])

  useEffect(() => {
    if (!isSuccess) {
      return
    }
    clearCart()
    router.replace('/(tabs)')
  }, [isSuccess, clearCart, router])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  const qrUrl = `https://placehold.co/250x250/000/FFF?text=Scan+Me%0A${total}`

  return (
    <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Scan to Pay' }} />
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>You are paying</ThemedText>
        <ThemedText style={styles.total}>฿ {total}</ThemedText>

        <Image source={{ uri: qrUrl }} style={styles.qrCode} />

        <View style={styles.timerContainer}>
          <Ionicons
            name="timer-outline"
            size={24}
            color={
              isSuccess
                ? '#3CB371'
                : secondsLeft > 0
                  ? themeColors.tint
                  : '#FF6347'
            }
          />
          <ThemedText
            style={
              isSuccess
                ? styles.successText
                : secondsLeft > 0
                  ? styles.timerText
                  : styles.timeoutText
            }
          >
            {isSuccess ? 'Success' : formatTime(secondsLeft)}
          </ThemedText>
        </View>

        <ThemedText style={styles.scanText}>
          Ask the merchant to scan this QR code to complete your payment.
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  )
}
