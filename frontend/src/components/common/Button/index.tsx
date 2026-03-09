import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  className = '',
  disabled,
  ...props 
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer'
  
  const variantClasses = {
    primary: 'bg-electric-blue text-white hover:bg-cyan-neon disabled:bg-gray-600',
    secondary: 'bg-gray-700 text-cloud-white hover:bg-gray-600 disabled:bg-gray-800 border border-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-900'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        isLoading ? 'opacity-50 cursor-wait' : ''
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  )
}
