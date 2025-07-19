'use client'

import { useAppSelector } from '@/store/hooks'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const authState = useAppSelector((state) => state.auth)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem('token'))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Estado de Autenticación</h1>
      
      <div className="space-y-2">
        <p><strong>Loading:</strong> {authState.loading ? 'true' : 'false'}</p>
        <p><strong>IsAuthenticated:</strong> {authState.isAuthenticated ? 'true' : 'false'}</p>
        <p><strong>Token (Redux):</strong> {authState.token ? 'Present' : 'Not present'}</p>
        <p><strong>Token (LocalStorage):</strong> {token ? 'Present' : 'Not present'}</p>
        <p><strong>User:</strong> {authState.user ? JSON.stringify(authState.user) : 'null'}</p>
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Reload Page
      </button>
      
      <button 
        onClick={() => {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }} 
        className="mt-4 ml-2 bg-red-500 text-white px-4 py-2 rounded"
      >
        Clear Token & Go to Login
      </button>
    </div>
  )
}