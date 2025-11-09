import {
  StyleSheet,
  View,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React, { useState, useEffect } from 'react'
import { Stack, useLocalSearchParams, Redirect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useCart } from '@/context/CartContext'
import { CartButton } from '@/components/atoms/CartButton'
import apiClient from '@/services/api'

interface Product {
  id: string
  name: string
  price: string
  image: string
  description: string
}

const getDynamicStyles = (themeColors: (typeof Colors)['light']) => {
  return StyleSheet.create({
    pageWrapper: {
      flex: 1,
      backgroundColor: themeColors.componentBackground,
    },
    safeAreaWrapper: {
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
    image: {
      width: '100%',
      height: 300,
      backgroundColor: themeColors.background,
    },
    content: {
      padding: 20,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 8,
    },
    price: {
      lineHeight:30,
      fontSize: 28,
      fontWeight: 'bold',
      color: themeColors.tint,
      marginBottom: 15,
    },
    description: {
      fontSize: 16,
      color: themeColors.text,
      lineHeight: 24,
    },
    addButton: {
      flexDirection: 'row',
      backgroundColor: themeColors.tint,
      padding: 15,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    addButtonText: {
      color: themeColors.tintForeground,
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
    },
  })
}

export default function ProductDetailScreen() {
  const { productId, merchantId } = useLocalSearchParams<{
    productId: string
    merchantId: string
  }>()
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)

  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId || !merchantId) {
      setError('Missing product or merchant ID.')
      setIsLoading(false)
      return
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.get<{ [id: string]: Product }>(
          `/merchants/${merchantId}/products/`
        )
        const productData = response.data[productId]
        if (productData) {
          setProduct(productData)
        } else {
          setError('Product not found.')
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError('Could not load product details.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId, merchantId])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product)
      console.log('Added to cart:', product.name)
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.pageWrapper, styles.centered]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    )
  }

  if (!product || error) {
    return <Redirect href="/(tabs)/nearYou" />
  }

  return (
    <View style={styles.pageWrapper}>
      <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
        <Stack.Screen options={{ title: product.name }} />
        <ScrollView style={styles.container}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={styles.content}>
            <ThemedText style={styles.name}>{product.name}</ThemedText>
            <ThemedText style={styles.price}>฿ {product.price}</ThemedText>
            <ThemedText style={styles.description}>
              {product.description}
            </ThemedText>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
            >
              <Ionicons
                name="add"
                size={24}
                color={themeColors.tintForeground}
              />
              <ThemedText style={styles.addButtonText}>Add to Cart</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <CartButton />
    </View>
  )
}
