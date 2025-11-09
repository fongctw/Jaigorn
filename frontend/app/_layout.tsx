import { Stack } from 'expo-router'
import { CartProvider } from '@/context/CartContext'
import { useColorScheme } from 'react-native'
import { Colors } from '@/constants/theme'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <CartProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: themeColors.background,
              },
              headerTintColor: themeColors.text,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ title: 'Profile' }} />
            <Stack.Screen
              name="transaction/[id]"
              options={{ title: 'Transaction' }}
            />
            <Stack.Screen name="shop/[id]" options={{ title: 'Shop' }} />
            <Stack.Screen
              name="product/[productId]"
              options={{ title: 'Product' }}
            />
            <Stack.Screen
              name="cart"
              options={{
                presentation: 'modal',
                title: 'Your Cart',
              }}
            />
            <Stack.Screen
              name="payment"
              options={{
                presentation: 'modal',
                title: 'Payment',
              }}
            />
            <Stack.Screen
              name="paymentQR"
              options={{
                presentation: 'modal',
                title: 'Scan to Pay',
              }}
            />
          </Stack>
        </CartProvider>
      </SafeAreaProvider>
    </AuthProvider>
  )
}
