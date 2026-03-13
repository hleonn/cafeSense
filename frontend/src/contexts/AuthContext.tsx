import React, { createContext, useState, useContext, useEffect } from 'react'
import axiosInstance from '../config/axios'

interface User {
  id: number
  email: string
  username: string
  full_name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string, full_name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await axiosInstance.get('/auth/me')
        setUser(response.data)
      } catch (error) {
        console.error('Error loading user:', error)
        localStorage.removeItem('token')
        setToken(null)
        delete axiosInstance.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  const login = async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const response = await axiosInstance.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    const { access_token } = response.data
    localStorage.setItem('token', access_token)
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    setToken(access_token)

    const userResponse = await axiosInstance.get('/auth/me')
    setUser(userResponse.data)
  }

  const register = async (email: string, username: string, password: string, full_name?: string) => {
    await axiosInstance.post('/auth/register', {
      email,
      username,
      password,
      full_name
    })
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axiosInstance.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
