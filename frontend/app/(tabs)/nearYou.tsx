import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  useColorScheme,
  ActivityIndicator,
} from 'react-native'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React, { useState, useEffect } from 'react'
import { Stack } from 'expo-router'
import { SearchBar } from '@/components/molecules/SearchBar'
import { ShopSection } from '@/components/organisms/ShopSection'
import apiClient from '@/services/api'

interface Shop {
  id: string
  name: string
  distance: string
  image: string
}

interface ShopSectionData {
  title: string
  data: Shop[]
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
      flex: 1,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: themeColors.text,
      fontSize: 16,
      textAlign: 'center',
    },
  })
}

export default function NearYouScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)

  const [originalSections, setOriginalSections] = useState<ShopSectionData[]>(
    []
  )
  const [filteredSections, setFilteredSections] = useState<ShopSectionData[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.get<ShopSectionData[]>(
          '/merchants/shops-sections/'
        )

        setOriginalSections(response.data)
        setFilteredSections(response.data)
      } catch (err) {
        console.error('Failed to fetch merchant categories:', err)
        setError('Could not load shop data.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredSections(originalSections)
      return
    }

    const lowerQuery = query.toLowerCase()

    const newFilteredSections = originalSections
      .map((section) => {
        const filteredShops = section.data.filter((shop) =>
          shop.name.toLowerCase().includes(lowerQuery)
        )
        return { ...section, data: filteredShops }
      })
      .filter((section) => section.data.length > 0)

    setFilteredSections(newFilteredSections)
  }

  const RenderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={themeColors.tint} />
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )
    }

    if (filteredSections.length === 0) {
      return (
        <View style={styles.centered}>
          <ThemedText>No shops found.</ThemedText>
        </View>
      )
    }

    return (
      <>
        {filteredSections.map((section) => (
          <ShopSection
            key={section.title}
            title={section.title}
            data={section.data}
          />
        ))}
        <View style={{ height: 20 }} />
      </>
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper}>
      <Stack.Screen options={{ title: 'Near You' }} />

      <ThemedView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <SearchBar onSearch={handleSearch} />
          <RenderContent />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}
