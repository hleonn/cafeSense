import axios from 'axios'

// Usar variable de entorno o URL de producción por defecto
const API_URL = import.meta.env.VITE_API_URL || 'https://cafesense.onrender.com'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosInstance
