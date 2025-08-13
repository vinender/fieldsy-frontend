import axios from 'axios'

const baseURL = (() => {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL
  if (env) {
    return env.endsWith('/api') ? env : `${env}/api`
  }
  return 'http://localhost:5001/api'
})()

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

// Initialize auth token from localStorage if available
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('authToken')
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
}

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
        delete apiClient.defaults.headers.common['Authorization']
      }
    }
    return Promise.reject(error)
  }
)


