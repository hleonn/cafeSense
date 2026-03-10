import { MainLayout } from '../../components/layout/MainLayout'
import { ComparisonChart } from '../../components/features/SimulationResults/ComparisonChart'
import { useSimulacion } from '../../hooks/useSimulacion'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon } from '@heroicons/react/24/outline'

export const Analytics = () => {
  const { resultadoLineal, resultadoRF } = useSimulacion()
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  const metrics = [
    { label: 'Impresiones', value: '45.2K', change: '+12%', icon: ChartBarIcon },
    { label: 'Alcance', value: '32.8K', change: '+8%', icon: ArrowTrendingUpIcon },
    { label: 'Visitantes únicos', value: '18.3K', change: '+15%', icon: UsersIcon },
  ]

  return (
    <MainLayout title="Analytics">
      <div className="space-y-6">
        {/* Filtros de período */}
        <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg w-fit border border-gray-700">
          {['day', 'week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-electric-blue text-white'
                  : 'text-gray-400 hover:text-cloud-white hover:bg-gray-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{metric.label}</p>
                  <p className="text-2xl font-bold text-cloud-white mt-1">{metric.value}</p>
                  <p className="text-cyan-neon text-sm mt-1">{metric.change}</p>
                </div>
                <metric.icon className="h-10 w-10 text-electric-blue opacity-50" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gráfico de simulación */}
        <div className="card">
          <h3 className="card-title mb-4">📊 Análisis de Elasticidad</h3>
          {resultadoLineal && resultadoRF ? (
            <ComparisonChart lineal={resultadoLineal} rf={resultadoRF} />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <span className="text-6xl mb-4">📈</span>
              <p>Ve al Dashboard y realiza una simulación</p>
              <p className="text-sm mt-2">para ver análisis detallados</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
