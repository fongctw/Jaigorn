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

  useEffect(() => {
    if (secondsLeft <= 0) {
      Alert.alert(
        'Payment Timed Out',
        'Your session has expired. Please try again.',
        [{ text: 'OK', onPress: () => router.back() }]
      )
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft, router])

  // --- Mock Payment Success (for demo) ---
  // In a real app, this would be triggered by a WebSocket or long-polling
  useEffect(() => {
    const mockPaymentTime = 10000 // Simulate success after 10 seconds
    const successTimer = setTimeout(() => {
      if (secondsLeft > 0) {
        clearCart()
        Alert.alert('Payment Successful!', 'Your payment has been received.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ])
      }
    }, mockPaymentTime)

    return () => clearTimeout(successTimer)
  }, [secondsLeft, clearCart, router])

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
            color={secondsLeft > 0 ? themeColors.tint : '#FF6347'}
          />
          <ThemedText
            style={secondsLeft > 0 ? styles.timerText : styles.timeoutText}
          >
            {formatTime(secondsLeft)}
          </ThemedText>
        </View>

        <ThemedText style={styles.scanText}>
          Ask the merchant to scan this QR code to complete your payment.
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  )
}
