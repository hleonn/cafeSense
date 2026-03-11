import { motion } from 'framer-motion'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export const LoadingSpinner: React.FC<Props> = ({ 
  size = 'md', 
  color = 'electric-blue' 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const colors = {
    'electric-blue': 'border-electric-blue',
    'cyan-neon': 'border-cyan-neon',
    'white': 'border-white',
    'gray': 'border-gray-500'
  }

  return (
    <div className="flex justify-center items-center">
      <motion.div
        className={`${sizes[size]} border-2 ${colors[color as keyof typeof colors] || 'border-electric-blue'} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}
