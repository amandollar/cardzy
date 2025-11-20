'use client'
import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext({})

export const useToast = () => useContext(ToastContext)

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto min-w-[200px] max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-md
              transform transition-all duration-300 animate-slide-up
              ${toast.type === 'error' ? 'bg-red-900/90 border-red-700 text-white' : 
                toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-700 text-white' : 
                'bg-slate-800/90 border-slate-600 text-white'}
            `}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold">
                {toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'} {toast.message}
              </span>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-white/50 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
