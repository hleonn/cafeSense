import { useState } from 'react'
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
import { BookmarkIcon } from '@heroicons/react/24/outline'

export const Dashboard = () => {
  const { cafes, selectedCafe, setSelectedCafe } = useCafes()
  const { resultadoLineal, resultadoRF, loading, simular } = useSimulacion()
  const { escenarios, guardarEscenario, eliminarEscenario } = useEscenarios()
  const [porcentaje, setPorcentaje] = useState(10)
  const [modalAbierto, setModalAbierto] = useState(false)

  const handleSimular = async () => {
    if (!selectedCafe) {
      toast.error('Por favor selecciona un café')
      return
    }
    
    await simular({
      cafe_id: selectedCafe.id,
      porcentaje_cambio: porcentaje
    })
    toast.success('¡Simulación completada!')
  }

  const handleGuardar = async (nombre: string, descripcion: string) => {
    if (!selectedCafe || !resultadoRF) return
    
    await guardarEscenario({
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
    })
    toast.success('¡Escenario guardado!')
    setModalAbierto(false)
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
              <ComparisonChart lineal={resultadoLineal} rf={resultadoRF} />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <span className="text-6xl mb-4">📊</span>
                <p>Selecciona un café y ajusta el precio</p>
                <p className="text-sm mt-2">para ver la simulación comparativa</p>
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
