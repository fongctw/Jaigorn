import * as SecureStore from 'expo-secure-store'

// Define the keys we'll use for storage
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

/**
 * Saves the auth tokens securely.
 * @param access - The access token
 * @param refresh - The refresh token
 */
export const saveTokens = async (access: string, refresh: string) => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access)
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh)
  } catch (error) {
    console.error('Error saving tokens:', error)
  }
}

/**
 * Retrieves the access token from secure storage.
 * @returns The access token or null if not found.
 */
export const getAccessToken = async () => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  } catch (error) {
    console.error('Error getting access token:', error)
    return null
  }
}

/**
 * Retrieves the refresh token from secure storage.
 * @returns The refresh token or null if not found.
 */
export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Error getting refresh token:', error)
    return null
  }
}

/**
 * Deletes all auth tokens from secure storage.
 */
export const deleteTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Error deleting tokens:', error)
  }
}
