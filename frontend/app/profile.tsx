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
import { Stack, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/context/AuthContext'
import apiClient from '@/services/api'

interface User {
  name: string
  profileImageUrl: string
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
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: themeColors.text,
      fontSize: 16,
      textAlign: 'center',
      padding: 20,
    },
    profileHeader: {
      alignItems: 'center',
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
    },
    profileName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    menuSection: {
      marginTop: 20,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.componentBackground,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
      borderTopWidth: 1,
      borderTopColor: themeColors.borderColor,
    },
    menuIcon: {
      marginRight: 15,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: themeColors.text,
    },
    menuArrow: {
      color: themeColors.secondaryText,
    },
  })
}

const ProfileMenuItem = ({
  icon,
  text,
  onPress,
  styles,
  themeColors,
}: {
  icon: keyof typeof Ionicons.glyphMap
  text: string
  onPress: () => void
  styles: ReturnType<typeof getDynamicStyles>
  themeColors: (typeof Colors)['light']
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons
      name={icon}
      size={22}
      color={themeColors.icon}
      style={styles.menuIcon}
    />
    <ThemedText style={styles.menuText}>{text}</ThemedText>
    <Ionicons
      name="chevron-forward"
      size={20}
      color={themeColors.secondaryText}
      style={styles.menuArrow}
    />
  </TouchableOpacity>
)

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)
  const router = useRouter()
  const { logout } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.get<User>('/users/me/')
        setUser(response.data)
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setError('Could not load your profile.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleEditProfile = () => console.log('Navigate to Edit Profile')
  const handleSettings = () => console.log('Navigate to Settings')
  const handleHelp = () => console.log('Navigate to Help Center')

  const handleLogout = () => {
    logout()
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.safeAreaWrapper, styles.centered]}
        edges={['bottom']}
      >
        <Stack.Screen options={{ title: 'Profile' }} />
        <ActivityIndicator size="large" color={themeColors.tint} />
      </SafeAreaView>
    )
  }

  if (error || !user) {
    return (
      <SafeAreaView
        style={[styles.safeAreaWrapper, styles.centered]}
        edges={['bottom']}
      >
        <Stack.Screen options={{ title: 'Profile' }} />
        <ThemedText style={styles.errorText}>
          {error || 'Profile data not found.'}
        </ThemedText>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user.profileImageUrl }}
            style={styles.profileImage}
          />
          <ThemedText style={styles.profileName}>{user.name}</ThemedText>
        </View>

        <View style={styles.menuSection}>
          <ProfileMenuItem
            icon="person-circle"
            text="Edit Profile"
            onPress={handleEditProfile}
            styles={styles}
            themeColors={themeColors}
          />
          <ProfileMenuItem
            icon="settings"
            text="Settings"
            onPress={handleSettings}
            styles={styles}
            themeColors={themeColors}
          />
          <ProfileMenuItem
            icon="help-buoy"
            text="Help Center"
            onPress={handleHelp}
            styles={styles}
            themeColors={themeColors}
          />
        </View>

        <View style={styles.menuSection}>
          <ProfileMenuItem
            icon="log-out"
            text="Log Out"
            onPress={handleLogout}
            styles={styles}
            themeColors={themeColors}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
