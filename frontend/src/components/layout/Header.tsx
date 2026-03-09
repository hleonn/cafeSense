import { motion } from 'framer-motion'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface Props {
  title: string
}

export const Header: React.FC<Props> = ({ title }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-4"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-cloud-white">{title}</h1>
          <p className="text-sm text-gray-500">All analytical view of your online store</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {['Today', 'Week', 'Month', 'Years'].map((period) => (
              <button
                key={period}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-cloud-white hover:bg-gray-700 rounded-md transition-colors"
              >
                {period}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-electric-blue text-white px-4 py-2 rounded-lg hover:bg-cyan-neon transition-colors">
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>
    </motion.header>
  )
}
