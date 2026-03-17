import React, { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { motion } from 'framer-motion'

interface Props {
    children: React.ReactNode
    title?: string
}

export const MainLayout: React.FC<Props> = ({ children, title = 'Dashboard' }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            setSidebarOpen(!mobile)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div className="flex h-screen bg-night-black overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <main className="flex-1 overflow-y-auto">
                <Header title={title} />

                {/* Usamos isMobile para ajustar algo en el UI si queremos */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`p-4 sm:p-6 ${isMobile ? 'pt-2' : ''}`}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    )
}