import {
  StyleSheet,
  View,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { userData } from '@/data/homeData'
import { useAuth } from '@/context/AuthContext'

const getDynamicStyles = (themeColors: (typeof Colors)['light']) => {
  return StyleSheet.create({
    safeAreaWrapper: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    container: {
      flex: 1,
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

  const handleEditProfile = () => console.log('Navigate to Edit Profile')
  const handleSettings = () => console.log('Navigate to Settings')
  const handleHelp = () => console.log('Navigate to Help Center')

  const handleLogout = () => {
    logout()
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userData.profileImageUrl }}
            style={styles.profileImage}
          />
          <ThemedText style={styles.profileName}>{userData.name}</ThemedText>
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
