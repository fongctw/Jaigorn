import {
  StyleSheet,
  View,
  useColorScheme,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React from 'react'
import { useCart, CartItem } from '@/context/CartContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Stack } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

const getDynamicStyles = (themeColors: (typeof Colors)['light']) => {
  return StyleSheet.create({
    safeAreaWrapper: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    container: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyIcon: {
      marginBottom: 20,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 5,
    },
    emptySubText: {
      fontSize: 14,
      color: themeColors.secondaryText,
      textAlign: 'center',
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: themeColors.componentBackground,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 10,
      marginRight: 15,
      backgroundColor: themeColors.background,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 3,
    },
    itemPrice: {
      fontSize: 14,
      color: themeColors.secondaryText,
    },
    itemControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    controlButton: {
      padding: 5,
    },
    itemQuantity: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text,
      minWidth: 20,
      textAlign: 'center',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: themeColors.borderColor,
      padding: 20,
      backgroundColor: themeColors.componentBackground,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    totalValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.tint,
    },
    payButton: {
      backgroundColor: themeColors.tint,
      padding: 15,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    payButtonText: {
      color: themeColors.tintForeground,
      fontSize: 18,
      fontWeight: 'bold',
    },
  })
}

const CartListItem = ({
  item,
  styles,
  themeColors,
}: {
  item: CartItem
  styles: any
  themeColors: any
}) => {
  const { addToCart, removeFromCart } = useCart()

  return (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.product.image }}
        style={styles.itemImage}
        contentFit="cover"
      />
      <View style={styles.itemInfo}>
        <ThemedText style={styles.itemName} numberOfLines={1}>
          {item.product.name}
        </ThemedText>
        <ThemedText style={styles.itemPrice}>
          ฿ {Number(item.product.price).toFixed(2)}
        </ThemedText>
      </View>
      <View style={styles.itemControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => removeFromCart(item.product.id)}
        >
          <Ionicons
            name="remove-circle-outline"
            size={24}
            color={themeColors.secondaryText}
          />
        </TouchableOpacity>
        <ThemedText style={styles.itemQuantity}>{item.quantity}</ThemedText>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => addToCart(item.product)}
        >
          <Ionicons name="add-circle" size={24} color={themeColors.tint} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function CartScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)
  const { cartItems, getCartTotal } = useCart()
  const router = useRouter()
  const itemsArray = Array.from(cartItems.values())

  const subtotal = getCartTotal()
  const finalTotal = subtotal

  const handlePayment = () => {
    router.push({
      pathname: '/payment',
      params: { total: finalTotal.toFixed(2) },
    })
  }

  if (itemsArray.length === 0) {
    return (
      <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Your Cart' }} />
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cart-outline"
            size={80}
            color={themeColors.secondaryText}
            style={styles.emptyIcon}
          />
          <ThemedText style={styles.emptyText}>Your Cart is Empty</ThemedText>
          <ThemedText style={styles.emptySubText}>
            Looks like you haven't added anything to your cart yet.
          </ThemedText>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Your Cart' }} />
      <ThemedView style={styles.container}>
        <FlatList
          data={itemsArray}
          keyExtractor={(item) => item.product.id}
          renderItem={({ item }) => (
            <CartListItem
              item={item}
              styles={styles}
              themeColors={themeColors}
            />
          )}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>
              ฿ {finalTotal.toFixed(2)}
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
            <ThemedText style={styles.payButtonText}>
              Pay ฿ {finalTotal.toFixed(2)}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  )
}
