import { useCafes } from '../../hooks/useCafes'
import { useSimulacion } from '../../hooks/useSimulacion'
import { CafeSelector } from '../../components/features/CafeSelector'
import { PriceSlider } from '../../components/features/PriceSlider'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { useState } from 'react'

export const Dashboard = () => {
  const { cafes, selectedCafe, setSelectedCafe, loading: loadingCafes } = useCafes()
  const { resultadoLineal, resultadoRF, loading, error, simular } = useSimulacion()
  const [porcentaje, setPorcentaje] = useState(10)

  const handleSimular = () => {
    if (!selectedCafe) return
    simular({
      cafe_id: selectedCafe.id,
      porcentaje_cambio: porcentaje
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Controles */}
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

        {/* Panel derecho - Resultados */}
        <Card title="📊 Resultados" className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {resultadoLineal && resultadoRF ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <p className="text-sm text-amber-600 mb-1">Recomendación</p>
                  <p className="text-lg font-bold text-amber-800">
                    {resultadoRF.recomendacion}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Demanda</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ingreso</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium">Actual</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoLineal.precio_actual.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">{resultadoLineal.demanda_actual}</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoLineal.ingreso_actual.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium">Lineal</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoLineal.nuevo_precio.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">{resultadoLineal.demanda_estimada}</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoLineal.ingreso_estimado.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium">Random Forest</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoRF.nuevo_precio.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">{resultadoRF.demanda_estimada}</td>
                      <td className="px-4 py-2 text-sm text-right">${resultadoRF.ingreso_estimado.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Selecciona un café y ajusta el precio para ver la simulación
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
