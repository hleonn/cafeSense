import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

export const testConnection = async () => {
  try {
    const response = await api.get('/health')
    console.log('✅ Conexión exitosa:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    return null
  }
}

export const testCafes = async () => {
  try {
    const response = await api.get('/cafes')
    console.log('✅ Cafés cargados:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error cargando cafés:', error)
    return null
  }
}
