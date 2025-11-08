import axios from 'axios'

const API_BASE_URL = process.env.API_BASE_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10-second timeout
})

apiClient.interceptors.request.use(async (config) => {
  // const token = await getAuthToken(); // Get token from storage
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config
})

export default apiClient
