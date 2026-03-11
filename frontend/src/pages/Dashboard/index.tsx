import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCafes } from '../../hooks/useCafes'
import { useSimulacion } from '../../hooks/useSimulacion'
import { useEscenarios } from '../../hooks/useEscenarios'
import { CafeSelector } from '../../components/features/CafeSelector'
import { PriceSlider } from '../../components/features/PriceSlider'
import { ComparisonChart } from '../../components/features/SimulationResults/ComparisonChart'
import { GuardarEscenarioModal } from '../../components/features/Scenarios/GuardarEscenarioModal'
import { ListaEscenarios } from '../../components/features/Scenarios/ListaEscenarios'
import { PDFGenerator } from '../../components/features/PDFGenerator'
import { KPIGrid } from '../../components/features/KPIs'
import { MainLayout } from '../../components/layout/MainLayout'
import { Button } from '../../components/common/Button'
import { BookmarkIcon, LightBulbIcon } from '@heroicons/react/24/outline'

export const Dashboard = () => {
  const { cafes, selectedCafe, setSelectedCafe, loading: loadingCafes } = useCafes()
  const { resultadoLineal, resultadoRF, loading, error, simular } = useSimulacion()
  const { escenarios, guardarEscenario, eliminarEscenario } = useEscenarios()
  const [porcentaje, setPorcentaje] = useState(10)
  const [modalAbierto, setModalAbierto] = useState(false)

  // Cargar simulación por defecto cuando se selecciona un café
  useEffect(() => {
    if (selectedCafe && !resultadoLineal && !resultadoRF && !loading) {
      console.log('Cargando simulación por defecto para:', selectedCafe.nombre)
      simular({
        cafe_id: selectedCafe.id,
        porcentaje_cambio: 10
      })
    }
  }, [selectedCafe])

  const handleSimular = async () => {
    if (!selectedCafe) {
      toast.error('Por favor selecciona un café')
      return
    }
    
    toast.promise(
      simular({
        cafe_id: selectedCafe.id,
        porcentaje_cambio: porcentaje
      }),
      {
        loading: 'Calculando impacto...',
        success: '¡Simulación completada!',
        error: 'Error en la simulación'
      }
    )
  }

  const handleGuardar = async (nombre: string, descripcion: string) => {
    if (!selectedCafe || !resultadoRF) return
    
    toast.promise(
      guardarEscenario({
        nombre,
        descripcion,
        cafe_id: selectedCafe.id,
        cafe_nombre: selectedCafe.nombre,
        precio_original: resultadoRF.precio_actual,
        precio_nuevo: resultadoRF.nuevo_precio,
        porcentaje_cambio: resultadoRF.cambio_porcentaje,
        impacto_lineal: resultadoLineal?.impacto_ingreso || 0,
        impacto_rf: resultadoRF.impacto_ingreso,
        recomendacion: resultadoRF.recomendacion
      }),
      {
        loading: 'Guardando escenario...',
        success: '¡Escenario guardado!',
        error: 'Error al guardar'
      }
    )
    setModalAbierto(false)
  }

  if (loadingCafes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue" />
        </div>
      </div>
    )
  }

  return (
    <MainLayout title="Dashboard">
      <KPIGrid />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="card-title mb-4">🎮 Panel de Control</h3>
            <div className="space-y-4">
              <CafeSelector
                cafes={cafes}
                selectedCafe={selectedCafe}
                onSelect={setSelectedCafe}
              />
              
              {selectedCafe && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <PriceSlider
                    precioActual={selectedCafe.precio_sugerido}
                    onChange={setPorcentaje}
                  />
                  
                  <Button
                    onClick={handleSimular}
                    isLoading={loading}
                    className="w-full"
                  >
                    Simular Impacto
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <ListaEscenarios
            escenarios={escenarios}
            onEliminar={eliminarEscenario}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📊 Resultados</h3>
              {resultadoLineal && resultadoRF && (
                <div className="flex gap-2">
                  <PDFGenerator
                    resultados={{ lineal: resultadoLineal, rf: resultadoRF }}
                    tipo="simulacion"
                  />
                  <Button
                    onClick={() => setModalAbierto(true)}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <BookmarkIcon className="h-4 w-4" />
                    Guardar
                  </Button>
                </div>
              )}
            </div>

            {resultadoLineal && resultadoRF ? (
              <div className="space-y-6">
                <ComparisonChart lineal={resultadoLineal} rf={resultadoRF} />
                
                {/* Recomendación destacada */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-electric-blue/10 to-cyan-neon/10 border-l-4 border-electric-blue p-4 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <LightBulbIcon className="h-6 w-6 text-electric-blue" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-cloud-white mb-1">
                        Recomendación basada en Random Forest
                      </h4>
                      <p className="text-sm text-gray-300">
                        {resultadoRF.recomendacion}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span>📈 Impacto: {resultadoRF.impacto_ingreso > 0 ? '+' : ''}{resultadoRF.impacto_ingreso.toFixed(1)}%</span>
                        <span>📊 Elasticidad: {resultadoLineal.elasticidad.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <span className="text-6xl mb-4">📊</span>
                </motion.div>
                <p>Selecciona un café y haz clic en "Simular Impacto"</p>
                <p className="text-sm mt-2">o ajusta el slider para ver resultados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {resultadoRF && selectedCafe && (
        <GuardarEscenarioModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onGuardar={handleGuardar}
          cafeNombre={selectedCafe.nombre}
          impacto={resultadoRF.impacto_ingreso}
        />
      )}
    </MainLayout>
  )
}
