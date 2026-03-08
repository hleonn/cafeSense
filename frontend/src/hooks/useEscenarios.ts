import { useState, useEffect } from 'react'
import { escenariosApi } from '../services/escenariosApi'
import { Escenario, EscenarioGuardado } from '../types/escenario'

export const useEscenarios = () => {
  const [escenarios, setEscenarios] = useState<EscenarioGuardado[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarEscenarios()
  }, [])

  const cargarEscenarios = async () => {
    setLoading(true)
    try {
      const data = await escenariosApi.obtenerTodos()
      console.log('📥 Datos crudos del backend:', data)
      
      const escenariosMapeados = data.map((item: any) => {
        // Extraer el ID del café de los cambios si existe
        let cafe_id = 1
        let cafe_nombre = 'Café sin nombre'
        
        if (item.cambios) {
          // Si hay cambios, tomar la primera clave como cafe_id
          const primeraClave = Object.keys(item.cambios)[0]
          if (primeraClave && primeraClave.startsWith('cafe_')) {
            cafe_id = parseInt(primeraClave.replace('cafe_', '')) || 1
          }
        }

        return {
          id: item.id,
          nombre: item.nombre || 'Sin nombre',
          descripcion: item.descripcion || '',
          cafe_id: cafe_id,
          cafe_nombre: cafe_nombre,
          precio_original: 0, // Estos vendrán de los cambios
          precio_nuevo: item.cambios ? Object.values(item.cambios)[0] as number || 0 : 0,
          porcentaje_cambio: 0,
          impacto_lineal: 0,
          impacto_rf: item.impacto_estimado || 0,
          recomendacion: '',
          fecha: item.fecha_creacion || new Date().toISOString()
        }
      })
      
      console.log('📊 Datos mapeados:', escenariosMapeados)
      setEscenarios(escenariosMapeados)
    } catch (err) {
      setError('Error al cargar escenarios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const guardarEscenario = async (escenario: Escenario) => {
    setLoading(true)
    try {
      console.log('📤 Guardando escenario:', escenario)
      
      // Preparar datos para el backend
      const datosParaBackend = {
        nombre: escenario.nombre,
        descripcion: escenario.descripcion,
        cambios: {
          [`cafe_${escenario.cafe_id}`]: escenario.precio_nuevo
        },
        impacto_estimado: escenario.impacto_rf
      }
      
      const nuevo = await escenariosApi.guardar(datosParaBackend)
      console.log('✅ Respuesta del backend:', nuevo)
      
      const nuevoMapeado = {
        id: nuevo.id,
        nombre: nuevo.nombre || escenario.nombre,
        descripcion: nuevo.descripcion || escenario.descripcion,
        cafe_id: escenario.cafe_id,
        cafe_nombre: escenario.cafe_nombre,
        precio_original: escenario.precio_original,
        precio_nuevo: escenario.precio_nuevo,
        porcentaje_cambio: escenario.porcentaje_cambio,
        impacto_lineal: escenario.impacto_lineal,
        impacto_rf: escenario.impacto_rf,
        recomendacion: escenario.recomendacion,
        fecha: nuevo.fecha_creacion || new Date().toISOString()
      }
      
      setEscenarios(prev => [nuevoMapeado, ...prev])
      return nuevoMapeado
    } catch (err) {
      setError('Error al guardar escenario')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const eliminarEscenario = async (id: number) => {
    setLoading(true)
    try {
      await escenariosApi.eliminar(id)
      setEscenarios(prev => prev.filter(esc => esc.id !== id))
      return true
    } catch (err) {
      setError('Error al eliminar escenario')
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    escenarios,
    loading,
    error,
    guardarEscenario,
    cargarEscenarios,
    eliminarEscenario,
  }
}
