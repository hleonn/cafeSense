import { motion } from 'framer-motion'
import { MainLayout } from '../../components/layout/MainLayout'
import { Button } from '../../components/common/Button'
import { Cog6ToothIcon, UsersIcon, LinkIcon } from '@heroicons/react/24/outline'

export const Admin = () => {
    return (
        <MainLayout title="Admin">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <UsersIcon className="h-6 w-6 text-electric-blue" />
                        <h3 className="text-lg font-semibold">Team Management</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Manage your team members and permissions</p>
                    <Button variant="primary" className="w-full">Manage Team</Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <LinkIcon className="h-6 w-6 text-cyan-neon" />
                        <h3 className="text-lg font-semibold">Integrations</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Connect with external services and APIs</p>
                    <Button variant="secondary" className="w-full">Configure</Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-2 card"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Cog6ToothIcon className="h-6 w-6 text-electric-blue" />
                        <h3 className="text-lg font-semibold">Settings</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Configure application preferences</p>
                    <Button variant="secondary" className="w-full">Open Settings</Button>
                </motion.div>
            </div>
        </MainLayout>
    )
}