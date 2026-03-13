import axios from 'axios'

// Usar variable de entorno o URL de producción por defecto
const API_URL = 'https://cafesense.onrender.com'
console.log('🔥 axios.ts se está ejecutando')
console.log('📡 Conectando a:', API_URL)
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
axiosInstance.get('/health')
    .then(res => console.log('✅ Health OK:', res.data))
    .catch(err => console.error('❌ Health Error:', err))
export default axiosInstance
