import { motion } from 'framer-motion'
import { MainLayout } from '../../components/layout/MainLayout'
import { DocumentTextIcon, ChatBubbleLeftIcon, SparklesIcon } from '@heroicons/react/24/outline'

export const ContentActivity = () => {
    const activities = [
        { label: 'Posts', value: '156', change: '+8', icon: DocumentTextIcon },
        { label: 'Replies', value: '892', change: '+23', icon: ChatBubbleLeftIcon },
        { label: 'Engagement Rate', value: '4.8%', change: '+0.5%', icon: SparklesIcon },
    ]

    return (
        <MainLayout title="Content Activity">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activities.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card text-center"
                    >
                        <item.icon className="h-8 w-8 text-electric-blue mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">{item.label}</p>
                        <p className="text-2xl font-bold text-cloud-white">{item.value}</p>
                        <p className="text-cyan-neon text-sm">{item.change}</p>
                    </motion.div>
                ))}
            </div>
        </MainLayout>
    )
}