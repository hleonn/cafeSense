import { useState } from 'react'
import axiosInstance from '../config/axios'

export interface SimulacionRequest {
  cafe_id: number
  porcentaje_cambio?: number
  nuevo_precio?: number
}

export interface SimulacionResponse {
  cafe_id: number
  cafe_nombre: string
  precio_actual: number
  nuevo_precio: number
  cambio_porcentaje: number
  demanda_actual: number
  demanda_estimada: number
  ingreso_actual: number
  ingreso_estimado: number
  impacto_ingreso: number
  elasticidad: number
  recomendacion: string
}

export const useSimulacion = () => {
  const [resultadoLineal, setResultadoLineal] = useState<SimulacionResponse | null>(null)
  const [resultadoRF, setResultadoRF] = useState<SimulacionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const simular = async (data: SimulacionRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const [lineal, rf] = await Promise.all([
        axiosInstance.post('/simular', data),
        axiosInstance.post('/simular-rf', data)
      ])
      
      setResultadoLineal(lineal.data)
      setResultadoRF(rf.data)
    } catch (err) {
      setError('Error en la simulación')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { resultadoLineal, resultadoRF, loading, error, simular }
}
