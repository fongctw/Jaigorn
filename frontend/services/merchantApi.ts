import apiClient from './api'

type Category = {
  id: string
  name: string
}

/**
 * Fetches the list of merchant categories
 * Django path: 'merchants/categories/'
 */
export const getMerchantCategories = () => {
  return apiClient.get<Category[]>('merchants/categories/')
}

/**
 * Applies to become a merchant
 * Django path: 'merchants/apply/'
 */
export const applyToBeMerchant = (data: any) => {
  return apiClient.post('merchants/apply/', data)
}

/**
 * Requests a transaction as a merchant
 * Django path: 'merchants/me/transactions/request/'
 */
export const requestMerchantTransaction = (data: any) => {
  return apiClient.post('merchants/me/transactions/request/', data)
}
