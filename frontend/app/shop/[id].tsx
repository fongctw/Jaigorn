import {
  StyleSheet,
  View,
  useColorScheme,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React, { useState, useMemo, useEffect } from 'react'
import { Stack, useLocalSearchParams, Redirect, Link } from 'expo-router'

import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { SearchBar } from '@/components/molecules/SearchBar'
import { CartButton } from '@/components/atoms/CartButton'
import apiClient from '@/services/api'

interface Product {
  id: string
  name: string
  price: string
  image: string
  description: string
}

interface ShopCategory {
  title: string
  products: string[]
}

interface ShopDetailsData {
  id: string
  name: string
  filters: string[]
  highlight: string[]
  categories: ShopCategory[]
}

type AllShopDetailsResponse = {
  [shopId: string]: ShopDetailsData
}

const getDynamicStyles = (themeColors: (typeof Colors)['light']) => {
  return StyleSheet.create({
    pageWrapper: {
      flex: 1,
      backgroundColor: themeColors.background,
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
      padding: 20,
    },

    filterScrollView: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    filterChip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: themeColors.componentBackground,
      marginRight: 10,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
    },
    filterChipActive: {
      backgroundColor: themeColors.tint,
      borderColor: themeColors.tint,
    },
    filterChipText: {
      fontSize: 14,
      color: themeColors.text,
    },
    filterChipTextActive: {
      color: themeColors.tintForeground,
      fontWeight: 'bold',
    },
    sectionContainer: {
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 15,
    },
    highlightGrid: {
      justifyContent: 'space-between',
    },
    productCard: {
      width: '48%',
      backgroundColor: themeColors.componentBackground,
      borderRadius: 10,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      marginBottom: 15,
    },
    productImage: {
      width: '100%',
      height: 120,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    productInfo: {
      padding: 10,
    },
    productName: {
      fontSize: 14,
      fontWeight: '500',
      color: themeColors.text,
      marginBottom: 3,
    },
    productFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    productPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    productListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: themeColors.componentBackground,
      borderRadius: 10,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      marginBottom: 10,
    },
    productListImage: {
      width: 60,
      height: 60,
      borderRadius: 10,
      marginRight: 10,
    },
    productListInfo: {
      flex: 1,
    },
    addIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: themeColors.tint,
      justifyContent: 'center',
      alignItems: 'center',
    },

    noResultsText: {
      textAlign: 'center',
      color: themeColors.secondaryText,
      marginTop: 20,
      fontStyle: 'italic',
      fontSize: 16,
    },
  })
}

const ProductCard = ({
  item,
  merchantId,
  styles,
  themeColors,
}: {
  item: Product
  merchantId: string
  styles: any
  themeColors: any
}) => (
  <Link
    href={{
      pathname: `/product/${item.id}`,
      params: { merchantId: merchantId },
    }}
    asChild
  >
    <TouchableOpacity style={styles.productCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        contentFit="cover"
      />
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <View style={styles.productFooter}>
          <ThemedText style={styles.productPrice}>฿ {item.price}</ThemedText>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={20} color={themeColors.tintForeground} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  </Link>
)

const ProductListItem = ({
  item,
  merchantId,
  styles,
  themeColors,
}: {
  item: Product
  merchantId: string
  styles: any
  themeColors: any
}) => (
  <Link
    href={{
      pathname: `/product/${item.id}`,
      params: { merchantId: merchantId },
    }}
    asChild
  >
    <TouchableOpacity style={styles.productListItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.productListImage}
        contentFit="cover"
      />
      <View style={styles.productListInfo}>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <ThemedText style={styles.productPrice}>฿ {item.price}</ThemedText>
      </View>
      <View style={styles.addIcon}>
        <Ionicons name="add" size={20} color={themeColors.tintForeground} />
      </View>
    </TouchableOpacity>
  </Link>
)

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)

  const [shop, setShop] = useState<ShopDetailsData | null>(null)
  const [products, setProducts] = useState<{ [id: string]: Product } | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    if (!id) {
      setError('No shop ID provided.')
      setIsLoading(false)
      return
    }

    const fetchShopData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [detailsResponse, productsResponse] = await Promise.all([
          apiClient.get<AllShopDetailsResponse>(`/merchants/all-details/`),
          apiClient.get<{ [id: string]: Product }>(
            `/merchants/${id}/products/`
          ),
        ])

        const specificShop = detailsResponse.data[id]
        if (!specificShop) {
          throw new Error(`Shop with ID ${id} not found.`)
        }

        setShop(specificShop)
        setProducts(productsResponse.data)
      } catch (err) {
        console.error('Failed to fetch shop details:', err)
        setError('Could not load shop data.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopData()
  }, [id])

  const getProduct = (productId: string): Product | undefined => {
    return products ? products[productId] : undefined
  }

  const filteredHighlights = useMemo(() => {
    if (!shop || !products) return []
    const query = searchQuery.toLowerCase()
    return shop.highlight
      .map(getProduct)
      .filter((p): p is Product => !!p)
      .filter((product) => product.name.toLowerCase().includes(query))
  }, [shop, products, searchQuery])

  const filteredCategories = useMemo(() => {
    if (!shop || !products) return []
    const query = searchQuery.toLowerCase()

    const categoryFiltered =
      activeFilter === 'All'
        ? shop.categories
        : shop.categories.filter((category) => category.title === activeFilter)

    return categoryFiltered
      .map((category) => ({
        ...category,
        products: category.products
          .map(getProduct)
          .filter((p): p is Product => !!p)
          .filter((product) => product.name.toLowerCase().includes(query)),
      }))
      .filter((category) => category.products.length > 0)
  }, [shop, products, searchQuery, activeFilter])

  if (isLoading) {
    return (
      <View style={[styles.pageWrapper, styles.centered]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.pageWrapper, styles.centered]}>
        <Stack.Screen options={{ title: 'Error' }} />
        <ThemedText style={styles.noResultsText}>{error}</ThemedText>
        <Link href="/(tabs)/nearYou" style={{ marginTop: 10 }}>
          <ThemedText style={{ color: themeColors.tint }}>Go Back</ThemedText>
        </Link>
      </View>
    )
  }

  if (!shop || !id) {
    return <Redirect href="/(tabs)/nearYou" />
  }

  const allFilterChips = ['All', ...shop.filters]

  return (
    <View style={styles.pageWrapper}>
      <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
        <Stack.Screen options={{ title: shop.name }} />
        <ScrollView style={styles.container}>
          <SearchBar onSearch={(q) => setSearchQuery(q)} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollView}
          >
            {allFilterChips.map((filter) => {
              const isActive = filter === activeFilter
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {filter}
                  </ThemedText>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {filteredHighlights.length > 0 && (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Highlight</ThemedText>
              <FlatList
                data={filteredHighlights}
                renderItem={({ item }) => (
                  <ProductCard
                    item={item}
                    merchantId={id}
                    styles={styles}
                    themeColors={themeColors}
                  />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.highlightGrid}
              />
            </View>
          )}

          {filteredCategories.map((category) => (
            <View key={category.title} style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>
                {category.title}
              </ThemedText>
              {category.products.map((product) => (
                <ProductListItem
                  key={product.id}
                  item={product}
                  merchantId={id}
                  styles={styles}
                  themeColors={themeColors}
                />
              ))}
            </View>
          ))}

          {filteredHighlights.length === 0 &&
            filteredCategories.length === 0 && (
              <ThemedText style={styles.noResultsText}>
                No products found{searchQuery ? ` for "${searchQuery}"` : ''}
              </ThemedText>
            )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>

      <CartButton />
    </View>
  )
}
