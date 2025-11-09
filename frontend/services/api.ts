import axios from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  deleteTokens,
} from './tokenStorage'
import { refreshToken as refreshAuthToken } from './userApi'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

if (!API_BASE_URL) {
  console.warn('API_BASE_URL is not set in your .env file.')
  console.log('Using default placeholder URL.')
}

const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8000/api/',
  timeout: 10000,
})

apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = await getAccessToken()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const currentRefreshToken = await getRefreshToken()
        if (!currentRefreshToken) {
          await deleteTokens()
          return Promise.reject(error)
        }

        const response = await refreshAuthToken(currentRefreshToken)
        const { access, refresh } = response.data

        await saveTokens(access, refresh)

        originalRequest.headers.Authorization = `Bearer ${access}`

        return apiClient(originalRequest)
      } catch (refreshError) {
        await deleteTokens()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
