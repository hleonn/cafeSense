import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  title?: string
}

export const MainLayout: React.FC<Props> = ({ children, title = 'Dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-night-black overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1 overflow-y-auto">
        <Header title={title} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
