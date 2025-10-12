import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface User {
  id: string
  email: string
  username: string
  isEmailVerified: boolean
  membership: {
    type: 'free' | 'premium' | 'vip'
    startDate?: string
    endDate?: string
    isActive: boolean
  }
  preferences: {
    language: 'zh' | 'ko' | 'en'
    theme: 'classic' | 'modern' | 'dark'
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await axios.post('/auth/login', { email, password })
          const { token, user } = response.data
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.message || 'Login failed')
        }
      },

      register: async (email: string, password: string, username: string) => {
        set({ isLoading: true })
        try {
          const response = await axios.post('/auth/register', { 
            email, 
            password, 
            username 
          })
          const { token, user } = response.data
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.message || 'Registration failed')
        }
      },

      logout: () => {
        // Clear axios default header
        delete axios.defaults.headers.common['Authorization']
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) return

        set({ isLoading: true })
        try {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          const response = await axios.get('/auth/me')
          const { user } = response.data
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error) {
          // Token is invalid, clear auth state
          delete axios.defaults.headers.common['Authorization']
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true })
        try {
          const response = await axios.put('/users/profile', data)
          const { user } = response.data
          
          set({ user, isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.message || 'Profile update failed')
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true })
        try {
          await axios.put('/users/password', { 
            currentPassword, 
            newPassword 
          })
          set({ isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.message || 'Password change failed')
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      })
    }
  )
)