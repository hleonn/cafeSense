import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

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

  // Configurar axios con el token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      console.log('Token configurado:', token)
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        console.log('No hay token, saltando carga de usuario')
        setLoading(false)
        return
      }

      try {
        console.log('Cargando usuario con token:', token)
        const response = await axios.get('/auth/me')
        console.log('Usuario cargado:', response.data)
        setUser(response.data)
      } catch (error) {
        console.error('Error loading user:', error)
        // Si hay error, eliminar el token inválido
        localStorage.removeItem('token')
        setToken(null)
        delete axios.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  const login = async (email: string, password: string) => {
    try {
      console.log('Intentando login con:', email)
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await axios.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Login response:', response.data)
      const { access_token } = response.data

      // Guardar token
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      setToken(access_token)

      // Pequeña pausa para asegurar que el token se guardó
      await new Promise(resolve => setTimeout(resolve, 100))

      // Cargar usuario
      const userResponse = await axios.get('/auth/me')
      console.log('Usuario cargado:', userResponse.data)
      setUser(userResponse.data)

    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
      // Limpiar cualquier token inválido
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setToken(null)
      throw error
    }
  }


  const register = async (email: string, username: string, password: string, full_name?: string) => {
    try {
      console.log('Intentando registro:', { email, username })
      const response = await axios.post('/auth/register', {
        email,
        username,
        password,
        full_name
      })
      console.log('Registro exitoso:', response.data)
      
      // Login automático
      await login(email, password)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    console.log('Sesión cerrada')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
