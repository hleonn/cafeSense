import { motion } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { UsersIcon, EyeIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'

interface KPI {
  label: string
  value: string
  trend: number
  icon: React.ElementType
  color: string
}

const kpis: KPI[] = [
  {
    label: 'Followers',
    value: '2.13M',
    trend: 6,
    icon: UsersIcon,
    color: 'text-electric-blue'
  },
  {
    label: 'Reach',
    value: '4.5M',
    trend: 12,
    icon: EyeIcon,
    color: 'text-cyan-neon'
  },
  {
    label: 'Engagement',
    value: '892K',
    trend: -2,
    icon: HeartIcon,
    color: 'text-purple-400'
  },
  {
    label: 'Sales Order',
    value: '32.4K',
    trend: 18,
    icon: ShoppingCartIcon,
    color: 'text-green-400'
  }
]

export const KPIGrid = () => {
  return (
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, index) => (
            <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="kpi-card group hover:scale-[1.02] transition-transform duration-200 p-3 sm:p-4"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="kpi-label text-xs sm:text-sm truncate">
                    {kpi.label}
                  </p>
                  <p className="kpi-value text-lg sm:text-xl lg:text-2xl mt-1 truncate">
                    {kpi.value}
                  </p>
                  <p className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                      kpi.trend > 0 ? 'trend-up' : 'trend-down'
                  }`}>
                    {kpi.trend > 0 ? (
                        <ArrowUpIcon className="h-3 w-3 flex-shrink-0" />
                    ) : (
                        <ArrowDownIcon className="h-3 w-3 flex-shrink-0" />
                    )}
                    <span>{Math.abs(kpi.trend)}%</span>
                  </p>
                </div>
                <kpi.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${kpi.color} opacity-80 flex-shrink-0`} />
              </div>

              {/* Barra de progreso simulada (opcional, para dar más contexto) */}
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(kpi.trend) * 3, 100)}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className={`h-full rounded-full ${
                        kpi.trend > 0 ? 'bg-cyan-neon' : 'bg-red-400'
                    }`}
                />
              </div>
            </motion.div>
        ))}
      </div>
  )
}