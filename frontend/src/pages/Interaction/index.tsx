import { motion } from 'framer-motion'
import { MainLayout } from '../../components/layout/MainLayout'
import {
    HeartIcon,
    ArrowPathIcon,
    BookmarkIcon,
    ShareIcon
} from '@heroicons/react/24/outline'

export const Interaction = () => {
    const interactions = [
        { label: 'Likes', value: '45.2K', change: '+5%', icon: HeartIcon },
        { label: 'Reposts', value: '12.8K', change: '+2%', icon: ArrowPathIcon },
        { label: 'Bookmarks', value: '8.3K', change: '+7%', icon: BookmarkIcon },
        { label: 'Shares', value: '15.6K', change: '+11%', icon: ShareIcon },
    ]

    return (
        <MainLayout title="Interaction">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interactions.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="card flex items-center justify-between"
                    >
                        <div>
                            <p className="text-gray-400 text-sm">{item.label}</p>
                            <p className="text-2xl font-bold text-cloud-white">{item.value}</p>
                            <p className="text-cyan-neon text-sm">{item.change}</p>
                        </div>
                        <item.icon className="h-10 w-10 text-electric-blue" />
                    </motion.div>
                ))}
            </div>
        </MainLayout>
    )
}