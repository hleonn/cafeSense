import { useState } from 'react'
import { useCafes } from '../../hooks/useCafes'
import { useSimulacion } from '../../hooks/useSimulacion'
import { useEscenarios } from '../../hooks/useEscenarios'
import { CafeSelector } from '../../components/features/CafeSelector'
import { PriceSlider } from '../../components/features/PriceSlider'
import { ComparisonChart } from '../../components/features/SimulationResults/ComparisonChart'
import { GuardarEscenarioModal } from '../../components/features/Scenarios/GuardarEscenarioModal'
import { ListaEscenarios } from '../../components/features/Scenarios/ListaEscenarios'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { BookmarkIcon } from '@heroicons/react/24/outline'

export const Dashboard = () => {
  const { cafes, selectedCafe, setSelectedCafe, loading: loadingCafes } = useCafes()
  const { resultadoLineal, resultadoRF, loading, error, simular } = useSimulacion()
  const { escenarios, guardarEscenario, eliminarEscenario } = useEscenarios()
  const [porcentaje, setPorcentaje] = useState(10)
  const [modalAbierto, setModalAbierto] = useState(false)

  const handleSimular = () => {
    if (!selectedCafe) return
    simular({
      cafe_id: selectedCafe.id,
      porcentaje_cambio: porcentaje
    })
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
  }

  if (loadingCafes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brown-800 mb-6">
        ☕ CafeSense - Simulador de Elasticidad
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel izquierdo - Controles y Escenarios */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="🎮 Panel de Control">
            <div className="space-y-6">
              <CafeSelector
                cafes={cafes}
                selectedCafe={selectedCafe}
                onSelect={setSelectedCafe}
              />
              
              {selectedCafe && (
                <>
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
                </>
              )}
            </div>
          </Card>

          <ListaEscenarios
            escenarios={escenarios}
            onEliminar={eliminarEscenario}
          />
        </div>

        {/* Panel derecho - Resultados */}
        <Card title="📊 Resultados" className="lg:col-span-3">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {resultadoLineal && resultadoRF ? (
            <div className="space-y-6">
              {/* Header con botón guardar */}
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-600 mb-1">Impacto (Lineal)</p>
                    <p className={`text-2xl font-bold ${
                      resultadoLineal.impacto_ingreso > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {resultadoLineal.impacto_ingreso > 0 ? '+' : ''}
                      {resultadoLineal.impacto_ingreso.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600 mb-1">Impacto (RF)</p>
                    <p className={`text-2xl font-bold ${
                      resultadoRF.impacto_ingreso > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {resultadoRF.impacto_ingreso > 0 ? '+' : ''}
                      {resultadoRF.impacto_ingreso.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-amber-600 mb-1">Elasticidad</p>
                    <p className="text-2xl font-bold text-amber-800">
                      {resultadoLineal.elasticidad.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => setModalAbierto(true)}
                  className="ml-4 flex items-center gap-2"
                  variant="secondary"
                >
                  <BookmarkIcon className="h-4 w-4" />
                  Guardar
                </Button>
              </div>

              {/* Gráficos */}
              <ComparisonChart lineal={resultadoLineal} rf={resultadoRF} />

              {/* Tabla de Resultados */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Demanda</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ingreso</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Δ %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium">Actual</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoLineal.precio_actual.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">{resultadoLineal.demanda_actual}</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoLineal.ingreso_actual.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">-</td>
                    </tr>
                    <tr className="bg-brown-50">
                      <td className="px-4 py-2 text-sm font-medium">Lineal</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoLineal.nuevo_precio.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">{resultadoLineal.demanda_estimada}</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoLineal.ingreso_estimado.toFixed(2)}</td>
                      <td className={`px-4 py-2 text-sm text-right font-bold ${
                        resultadoLineal.impacto_ingreso > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {resultadoLineal.impacto_ingreso > 0 ? '+' : ''}
                        {resultadoLineal.impacto_ingreso.toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium">Random Forest</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoRF.nuevo_precio.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">{resultadoRF.demanda_estimada}</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoRF.ingreso_estimado.toFixed(2)}</td>
                      <td className={`px-4 py-2 text-sm text-right font-bold ${
                        resultadoRF.impacto_ingreso > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {resultadoRF.impacto_ingreso > 0 ? '+' : ''}
                        {resultadoRF.impacto_ingreso.toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Recomendación */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      <span className="font-bold">Recomendación: </span>
                      {resultadoRF.recomendacion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <span className="text-6xl mb-4">📊</span>
              <p>Selecciona un café y ajusta el precio</p>
              <p className="text-sm mt-2">para ver la simulación comparativa</p>
            </div>
          )}
        </Card>
      </div>

      {/* Modal para guardar escenario */}
      {resultadoRF && selectedCafe && (
        <GuardarEscenarioModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onGuardar={handleGuardar}
          cafeNombre={selectedCafe.nombre}
          impacto={resultadoRF.impacto_ingreso}
        />
      )}
    </div>
  )
}
