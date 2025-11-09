import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React from 'react'
import { useCart } from '@/context/CartContext'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IconSymbol } from '../ui/icon-symbol'

export const CartButton = () => {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const { getCartCount } = useCart()
  const count = getCartCount()
  const insets = useSafeAreaInsets()

  return (
    <Link href="/cart" asChild>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: themeColors.tint,
            bottom: insets.bottom + 20,
            right: insets.right + 20,
          },
        ]}
      >
        <IconSymbol name="cart" size={32} color="white" />
        <View
          style={[
            styles.badge,
            {
              backgroundColor: count > 0 ? '#007AFF' : themeColors.icon,
              opacity: count > 0 ? 1 : 0.8,
            },
          ]}
        >
          <ThemedText style={styles.badgeText}>{count}</ThemedText>
        </View>
      </TouchableOpacity>
    </Link>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
  },
  badge: {
    position: 'absolute',
    top: -30,
    right: 30,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
})
