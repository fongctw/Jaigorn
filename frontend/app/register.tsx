import {
  StyleSheet,
  View,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Text,
  ActivityIndicator,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/context/AuthContext'
import { Stack, Link } from 'expo-router'

const getDynamicStyles = (themeColors: (typeof Colors)['light']) => {
  return StyleSheet.create({
    safeAreaWrapper: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 30,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: themeColors.tint,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: themeColors.secondaryText,
      textAlign: 'center',
      marginBottom: 40,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.componentBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      paddingHorizontal: 15,
      marginBottom: 15,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      fontSize: 16,
      color: themeColors.text,
    },
    registerButton: {
      backgroundColor: themeColors.tint,
      padding: 15,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      flexDirection: 'row',
      gap: 10,
    },
    registerButtonText: {
      color: themeColors.tintForeground,
      fontSize: 18,
      fontWeight: 'bold',
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      marginBottom: 10,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    loginText: {
      color: themeColors.secondaryText,
    },
    loginLink: {
      color: themeColors.tint,
      fontWeight: 'bold',
      marginLeft: 5,
    },
  })
}

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const themeColors = Colors[colorScheme]
  const styles = getDynamicStyles(themeColors)

  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await register({ username, email, password })
    } catch (err: any) {
      setError('Registration failed. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeAreaWrapper} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText style={styles.title}>Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>Join JAI KORN today</ThemedText>

        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={themeColors.secondaryText}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={themeColors.secondaryText}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={themeColors.secondaryText}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={themeColors.secondaryText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={themeColors.secondaryText}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={themeColors.secondaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={themeColors.tintForeground} />
          ) : (
            <ThemedText style={styles.registerButtonText}>Sign Up</ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <ThemedText style={styles.loginText}>
            Already have an account?
          </ThemedText>
          <Link href="/login">
            <ThemedText style={styles.loginLink}>Log In</ThemedText>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
