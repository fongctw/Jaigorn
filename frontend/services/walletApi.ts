import apiClient from './api'

type Bill = {
  id: string
  amount: number
  [key: string]: any
}

type Transaction = {
  id: string
  [key: string]: any
}

type CreditSummary = {
  available: number
  total: number
  [key: string]: any
}

/**
 * Fetches the list of bills for the home screen
 * Django path: 'wallets/home/bills/'
 */
export const getHomeBills = () => {
  // apiClient.get() combines the baseURL with 'wallets/home/bills/'
  return apiClient.get<Bill[]>('wallets/home/bills/')
}

/**
 * Fetches the user's credit summary
 * Django path: 'wallets/me/summary/'
 */
export const getCreditSummary = () => {
  return apiClient.get<CreditSummary>('wallets/me/summary/')
}

/**
 * Fetches the user's transaction history
 * Django path: 'wallets/me/transactions/'
 */
export const getTransactionHistory = () => {
  return apiClient.get<Transaction[]>('wallets/me/transactions/')
}

/**
 * Fetches the list of unpaid bills
 * Django path: 'wallets/bills/'
 */
export const getUnpaidBills = () => {
  return apiClient.get<Bill[]>('wallets/bills/')
}

/**
 * Pays a specific bill
 * Django path: 'wallets/bills/<uuid:pk>/pay/'
 */
export const payBill = (billId: string) => {
  // This is a POST request, as defined by RepayBillAPIView
  return apiClient.post(`wallets/bills/${billId}/pay/`)
}

/**
 * Pays a specific payment request
 * Django path: 'wallets/payment-requests/<uuid:pk>/pay/'
 */
export const payPaymentRequest = (requestId: string, data?: any) => {
  return apiClient.post(`wallets/payment-requests/${requestId}/pay/`, data)
}
