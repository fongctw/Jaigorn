import apiClient from './api'

// --- Types ---

export type UserLoginData = {
  username: string
  password: string
}

type AuthToken = {
  access: string
  refresh: string
}

type User = {
  id: string
  username: string
  [key: string]: any
}

/**
 * Authenticates a user and gets tokens
 * Django path: 'users/token/'
 */
export const loginUser = (username: string, password: string) => {
  return apiClient.post<AuthToken>('users/token/', { username, password })
}

/**
 * Refreshes an auth token
 * Django path: 'users/token/refresh/'
 */
export const refreshToken = (refresh: string) => {
  return apiClient.post<AuthToken>('users/token/refresh/', { refresh })
}

/**
 * Fetches the current user's details
 * Django path: 'users/me/'
 */
export const getMe = () => {
  // This will require an auth token in the apiClient interceptor
  return apiClient.get<User>('users/me/')
}

/**
 * Registers a new user
 * Django path: 'users/register/'
 */
export const registerUser = (data: any) => {
  return apiClient.post<User>('users/register/', data)
}
