'use client'

import { useAppSelector } from '@/store/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const router = useRouter()
  const authState = useAppSelector((state) => state.auth)
  const [token, setToken] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setToken(localStorage.getItem('token'))
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Debug - Estado de Autenticación</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">Redux State:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(authState, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">LocalStorage Token:</h2>
            <p className="text-sm">{token ? `Presente (${token.substring(0, 20)}...)` : 'No encontrado'}</p>
          </div>

          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ir a Login
            </button>
            
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Ir a Dashboard
            </button>
            
            <button 
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Ir a Admin (directo)
            </button>
            
            <button 
              onClick={() => {
                localStorage.removeItem('token')
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Limpiar Token
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}