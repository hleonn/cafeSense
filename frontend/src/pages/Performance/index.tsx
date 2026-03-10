import { MainLayout } from '../../components/layout/MainLayout'
import { ComparisonChart } from '../../components/features/SimulationResults/ComparisonChart'
import { useSimulacion } from '../../hooks/useSimulacion'
import { motion } from 'framer-motion'
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

export const Performance = () => {
  const { resultadoLineal, resultadoRF } = useSimulacion()

  const metrics = [
    {
      label: 'Mejor modelo',
      value: resultadoLineal && resultadoRF 
        ? (resultadoLineal.impacto_ingreso > resultadoRF.impacto_ingreso ? 'Lineal' : 'Random Forest')
        : 'Pendiente',
      icon: ChartBarIcon,
      color: 'text-cyan-neon'
    },
    {
      label: 'Impacto promedio',
      value: resultadoLineal && resultadoRF
        ? `${((resultadoLineal.impacto_ingreso + resultadoRF.impacto_ingreso) / 2).toFixed(1)}%`
        : '-',
      icon: ArrowTrendingUpIcon,
      color: 'text-electric-blue'
    }
  ]

  return (
    <MainLayout title="Performance">
      <div className="space-y-6">
        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{metric.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color} opacity-50`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gráfico de rendimiento */}
        <div className="card">
          <h3 className="card-title mb-4">📈 Rendimiento de Modelos</h3>
          {resultadoLineal && resultadoRF ? (
            <ComparisonChart lineal={resultadoLineal} rf={resultadoRF} />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <span className="text-6xl mb-4">📊</span>
              <p>Realiza una simulación en Dashboard</p>
              <p className="text-sm mt-2">para ver el rendimiento comparativo</p>
            </div>
          )}
        </div>

        {/* Comparativa rápida */}
        {resultadoLineal && resultadoRF && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card border-l-4 border-electric-blue"
            >
              <h4 className="font-semibold text-cloud-white mb-2">Modelo Lineal</h4>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">
                  Impacto: <span className={resultadoLineal.impacto_ingreso > 0 ? 'text-cyan-neon' : 'text-red-400'}>
                    {resultadoLineal.impacto_ingreso > 0 ? '+' : ''}{resultadoLineal.impacto_ingreso.toFixed(1)}%
                  </span>
                </p>
                <p className="text-gray-400 text-sm">
                  Elasticidad: <span className="text-cloud-white">{resultadoLineal.elasticidad.toFixed(2)}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Demanda: <span className="text-cloud-white">{resultadoLineal.demanda_estimada}</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card border-l-4 border-cyan-neon"
            >
              <h4 className="font-semibold text-cloud-white mb-2">Random Forest</h4>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">
                  Impacto: <span className={resultadoRF.impacto_ingreso > 0 ? 'text-cyan-neon' : 'text-red-400'}>
                    {resultadoRF.impacto_ingreso > 0 ? '+' : ''}{resultadoRF.impacto_ingreso.toFixed(1)}%
                  </span>
                </p>
                <p className="text-gray-400 text-sm">
                  Elasticidad: <span className="text-cloud-white">{resultadoRF.elasticidad.toFixed(2)}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Demanda: <span className="text-cloud-white">{resultadoRF.demanda_estimada}</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
