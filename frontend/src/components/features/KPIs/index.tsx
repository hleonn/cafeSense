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
    <div className="stat-grid">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="kpi-card"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value">{kpi.value}</p>
              <p className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                kpi.trend > 0 ? 'trend-up' : 'trend-down'
              }`}>
                {kpi.trend > 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                {Math.abs(kpi.trend)}%
              </p>
            </div>
            <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-80`} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
