import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  UsersIcon,
  EyeIcon,
  BookmarkIcon,
  ShareIcon,
  PresentationChartLineIcon,
  LinkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface MenuItem {
  name: string
  icon: React.ElementType
  path: string
  subItems?: { name: string; path: string; icon?: React.ElementType }[]
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard',
    subItems: []
  },
  {
    name: 'Analytics',
    icon: ChartBarIcon,
    path: '/analytics',
    subItems: []
  },
  {
    name: 'Audience',
    icon: UserGroupIcon,
    path: '/audience',
    subItems: [
      { name: 'Followers', path: '/audience', icon: UsersIcon },
      { name: 'Verified Followers', path: '/audience?tab=verified', icon: EyeIcon },
      { name: 'Profile Visits', path: '/audience?tab=visits', icon: EyeIcon },
      { name: 'Impressions', path: '/audience?tab=impressions', icon: ChartBarIcon }
    ]
  },
  {
    name: 'Interaction',
    icon: HeartIcon,
    path: '/interaction',
    subItems: [
      { name: 'Likes', path: '/interaction?tab=likes', icon: HeartIcon },
      { name: 'Reposts', path: '/interaction?tab=reposts', icon: ShareIcon },
      { name: 'Bookmarks', path: '/interaction?tab=bookmarks', icon: BookmarkIcon },
      { name: 'Shares', path: '/interaction?tab=shares', icon: ShareIcon }
    ]
  },
  {
    name: 'Content Activity',
    icon: DocumentTextIcon,
    path: '/content-activity',
    subItems: [
      { name: 'Posts', path: '/content-activity?tab=posts', icon: DocumentTextIcon },
      { name: 'Replies', path: '/content-activity?tab=replies', icon: DocumentTextIcon },
      { name: 'Engagement rate', path: '/content-activity?tab=engagement', icon: ChartBarIcon }
    ]
  },
  {
    name: 'Performance',
    icon: PresentationChartLineIcon,
    path: '/performance',
    subItems: [
      { name: 'Engagement', path: '/performance?tab=engagement', icon: ChartBarIcon },
      { name: 'Engagement rate', path: '/performance?tab=rate', icon: ChartBarIcon }
    ]
  },
  {
    name: 'Admin',
    icon: Cog6ToothIcon,
    path: '/admin',
    subItems: [
      { name: 'Team Management', path: '/admin?tab=team', icon: UsersIcon },
      { name: 'Integration', path: '/admin?tab=integration', icon: LinkIcon },
      { name: 'Setting', path: '/admin?tab=settings', icon: Cog6ToothIcon }
    ]
  }
]

interface Props {
  isOpen: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<Props> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  // Determinar qué menú expandir basado en la ruta actual
  useEffect(() => {
    const currentPath = location.pathname
    const currentItem = menuItems.find(item =>
        currentPath.startsWith(item.path) && item.path !== '/dashboard'
    )
    if (currentItem) {
      setExpandedMenu(currentItem.name)
    } else {
      setExpandedMenu(null)
    }
  }, [location.pathname])

  const handleNavigation = (path: string) => {
    console.log('Navegando a:', path)
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/'
    }
    return location.pathname === path || location.pathname.startsWith(path.split('?')[0])
  }

  const isSubItemActive = (path: string) => {
    return location.pathname + location.search === path
  }

  return (
      <motion.aside
          initial={{ width: isOpen ? 280 : 80 }}
          animate={{ width: isOpen ? 280 : 80 }}
          transition={{ duration: 0.3 }}
          className="relative h-screen bg-gray-900 border-r border-gray-800 overflow-hidden flex flex-col"
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

        <div
            className="p-4 border-b border-gray-800 cursor-pointer flex-shrink-0"
            onClick={() => handleNavigation('/dashboard')}
        >
          <motion.div
              animate={{ opacity: isOpen ? 1 : 0 }}
              className={`${isOpen ? 'block' : 'hidden'}`}
          >
            <h1 className="text-xl font-bold text-electric-blue">cafeSense</h1>
            <p className="text-xs text-gray-500">Analytics Dashboard</p>
          </motion.div>
          {!isOpen && (
              <div className="flex justify-center">
                <SparklesIcon className="h-8 w-8 text-electric-blue" />
              </div>
          )}
        </div>

        {isOpen && user && (
            <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/50">
              <p className="text-sm text-cloud-white font-medium">{user.full_name || user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
        )}

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
              <div key={item.name}>
                <button
                    onClick={() => {
                      handleNavigation(item.path)
                      if (item.subItems && item.subItems.length > 0) {
                        setExpandedMenu(expandedMenu === item.name ? null : item.name)
                      } else {
                        setExpandedMenu(null)
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path)
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
                  {isOpen && expandedMenu === item.name && item.subItems && item.subItems.length > 0 && (
                      <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-8 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.subItems.map((subItem) => (
                            <button
                                key={subItem.name}
                                onClick={() => handleNavigation(subItem.path)}
                                className={`w-full flex items-center gap-2 text-left text-xs py-1.5 px-3 rounded-lg transition-colors ${
                                    isSubItemActive(subItem.path)
                                        ? 'text-cyan-neon bg-gray-800'
                                        : 'text-gray-500 hover:text-cyan-neon hover:bg-gray-800/50'
                                }`}
                            >
                              {subItem.icon && <subItem.icon className="h-3 w-3" />}
                              {subItem.name}
                            </button>
                        ))}
                      </motion.div>
                  )}
                </AnimatePresence>
              </div>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-800 flex-shrink-0">
          <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {isOpen && (
                  <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex-1 text-left text-sm"
                  >
                    Sign Out
                  </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
  )
}