import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
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
        primary: 'bg-brown-600 text-white hover:bg-brown-700 disabled:bg-brown-300',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100'
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