import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react'
import { useRouter, useSegments, useRootNavigationState } from 'expo-router'
import {
  saveTokens,
  deleteTokens,
  getAccessToken,
} from '@/services/tokenStorage'
import { loginUser, registerUser, UserLoginData } from '@/services/userApi'

interface AuthContextType {
  isLoggedIn: boolean
  login: (data: UserLoginData) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const segments = useSegments()
  const rootNavigationState = useRootNavigationState()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAccessToken()
        setIsLoggedIn(!!token)
      } catch (e) {
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!rootNavigationState?.key || segments.length < 1) {
      return
    }
    const firstSegment = segments[0]

    if (firstSegment === 'login' || firstSegment === 'register') {
      if (isLoggedIn) {
        router.replace('/(tabs)')
      }
      return
    }

    if (!isLoggedIn) {
      router.replace('/login')
    }
  }, [isLoading, isLoggedIn, segments, rootNavigationState, router])

  const login = async (data: UserLoginData) => {
    try {
      const response = await loginUser(data.username, data.password)
      const { access, refresh } = response.data
      await saveTokens(access, refresh)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (data: any) => {
    try {
      await registerUser(data)
      await login({ username: data.username, password: data.password })
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = async () => {
    await deleteTokens()
    setIsLoggedIn(false)
  }

  const value = {
    isLoggedIn,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider')
  }
  return context
}
