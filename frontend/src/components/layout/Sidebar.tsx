import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  UsersIcon,
  HeartIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface MenuItem {
  name: string
  icon: React.ElementType
  subItems?: string[]
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: HomeIcon,
    subItems: ['Analytics', 'Followers', 'Verified Followers', 'Profile Visits', 'Impressions']
  },
  {
    name: 'Audience',
    icon: UsersIcon,
    subItems: ['Followers', 'Verified Followers', 'Profile Visits', 'Impressions']
  },
  {
    name: 'Interaction',
    icon: HeartIcon,
    subItems: ['Likes', 'Reposts', 'Bookmarks', 'Shares']
  },
  {
    name: 'Content Activity',
    icon: DocumentTextIcon,
    subItems: ['Posts', 'Replies', 'Engagement rate']
  },
  {
    name: 'Performance',
    icon: PresentationChartLineIcon,
    subItems: ['Engagement', 'Engagement rate']
  },
  {
    name: 'Admin',
    icon: Cog6ToothIcon,
    subItems: ['Team Management', 'Integration', 'Setting']
  }
]

interface Props {
  isOpen: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<Props> = ({ isOpen, onToggle }) => {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard')
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Dashboard')

  return (
    <motion.aside
      initial={{ width: isOpen ? 280 : 80 }}
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ duration: 0.3 }}
      className="relative h-screen bg-gray-900 border-r border-gray-800 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 bg-electric-blue rounded-full p-1.5 hover:bg-cyan-neon transition-colors"
      >
        {isOpen ? (
          <ChevronLeftIcon className="h-4 w-4 text-white" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-white" />
        )}
      </button>

      <div className="p-4 border-b border-gray-800">
        <motion.div
          animate={{ opacity: isOpen ? 1 : 0 }}
          className={`${isOpen ? 'block' : 'hidden'}`}
        >
          <h1 className="text-xl font-bold text-electric-blue">Visiora</h1>
          <p className="text-xs text-gray-500">Analytics Dashboard</p>
        </motion.div>
        {!isOpen && (
          <div className="flex justify-center">
            <SparklesIcon className="h-8 w-8 text-electric-blue" />
          </div>
        )}
      </div>

      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
        {menuItems.map((item) => (
          <div key={item.name}>
            <button
              onClick={() => {
                setSelectedMenu(item.name)
                setExpandedMenu(expandedMenu === item.name ? null : item.name)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                selectedMenu === item.name
                  ? 'bg-electric-blue text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-cloud-white'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1 text-left text-sm"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {isOpen && expandedMenu === item.name && item.subItems && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-8 mt-1 space-y-1 overflow-hidden"
                >
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem}
                      className="w-full text-left text-xs text-gray-500 hover:text-cyan-neon py-1.5 px-3 rounded-lg transition-colors"
                    >
                      {subItem}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </motion.aside>
  )
}
