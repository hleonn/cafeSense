import { motion } from 'framer-motion'
import { ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

interface Props {
  title: string
}

export const Header: React.FC<Props> = ({ title }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('Week')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
      <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-3 sm:p-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">

          {/* Título y subtítulo */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-cloud-white truncate">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {isMobile ? 'Analytics' : 'All analytical view of your online store'}
            </p>
          </div>

          {/* Filtros y botones */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

            {/* Selector de período (versión desktop) */}
            <div className="hidden sm:flex bg-gray-800 rounded-lg p-1">
              {['Today', 'Week', 'Month', 'Years'].map((period) => (
                  <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          selectedPeriod === period
                              ? 'bg-electric-blue text-white'
                              : 'text-gray-400 hover:text-cloud-white hover:bg-gray-700'
                      }`}
                  >
                    {period}
                  </button>
              ))}
            </div>

            {/* Selector de período (versión móvil - dropdown) */}
            <div className="sm:hidden flex-1">
              <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-cloud-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              >
                <option value="Today">Today</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="Years">Years</option>
              </select>
            </div>

            {/* Botón de exportar */}
            <button className="flex items-center gap-2 bg-electric-blue text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-cyan-neon transition-colors text-sm sm:text-base whitespace-nowrap">
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span className="hidden xs:inline">Export</span>
            </button>

            {/* Botón de calendario (solo móvil) */}
            <button className="sm:hidden flex items-center justify-center bg-gray-800 text-gray-300 p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <CalendarIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda rápida (opcional, para móvil) */}
        {isMobile && (
            <div className="mt-3">
              <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-cloud-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            </div>
        )}
      </motion.header>
  )
}