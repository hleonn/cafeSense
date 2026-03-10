import { Toaster } from 'react-hot-toast'

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1E293B',
          color: '#F5F6FA',
          border: '1px solid #334155',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#00CEC9',
            secondary: '#F5F6FA',
          },
          style: {
            border: '1px solid #00CEC9',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#F5F6FA',
          },
          style: {
            border: '1px solid #EF4444',
          },
        },
      }}
    />
  )
}
