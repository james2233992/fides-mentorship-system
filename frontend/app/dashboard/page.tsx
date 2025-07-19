'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Add a small delay to ensure the state is properly loaded
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          // Redirect based on user role
          switch (user.role) {
            case 'admin':
              router.push('/admin')
              break
            case 'mentor':
              router.push('/mentor')
              break
            case 'mentee':
              router.push('/mentee')
              break
            default:
              router.push('/login')
          }
        } else {
          router.push('/login')
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [user, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}