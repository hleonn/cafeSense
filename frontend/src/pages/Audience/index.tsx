import { motion } from 'framer-motion'
import { MainLayout } from '../../components/layout/MainLayout'
import { UsersIcon, EyeIcon, HeartIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export const Audience = () => {
    const metrics = [
        { label: 'Total Followers', value: '2.13M', change: '+12%', icon: UsersIcon },
        { label: 'Verified Followers', value: '892K', change: '+8%', icon: EyeIcon },
        { label: 'Profile Visits', value: '4.5M', change: '+15%', icon: ChartBarIcon },
        { label: 'Impressions', value: '12.8M', change: '+23%', icon: HeartIcon },
    ]

    return (
        <MainLayout title="Audience">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <p className="text-3xl font-bold text-cloud-white mt-2">{metric.value}</p>
                                <p className="text-cyan-neon text-sm mt-1">{metric.change}</p>
                            </div>
                            <metric.icon className="h-12 w-12 text-electric-blue opacity-50" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </MainLayout>
    )
}