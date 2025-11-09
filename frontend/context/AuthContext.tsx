import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react'
import { useRouter, useSegments } from 'expo-router'

interface AuthContextType {
  isLoggedIn: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function useProtectedRouter() {
  const router = useRouter()
  const segments = useSegments()
  const [isRouterReady, setIsRouterReady] = useState(false)

  useEffect(() => {
    if (segments.length > 0) {
      setIsRouterReady(true)
    }
  }, [segments])

  return { router, segments, isRouterReady }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { router, segments, isRouterReady } = useProtectedRouter()

  useEffect(() => {
    if (!isRouterReady) {
      return
    }
    const inLoginScreen = segments[0] === 'login'

    if (isLoggedIn && inLoginScreen) {
      router.replace('/(tabs)')
    } else if (!isLoggedIn && !inLoginScreen) {
      router.replace('/login')
    }
  }, [isLoggedIn, segments, router, isRouterReady])

  const login = () => {
    setIsLoggedIn(true)
  }

  const logout = () => {
    setIsLoggedIn(false)
  }

  const value = {
    isLoggedIn,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
