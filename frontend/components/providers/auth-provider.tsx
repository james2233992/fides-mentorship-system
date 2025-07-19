'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { loginSuccess, setLoading } from '@/store/slices/authSlice'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const response = await fetch('http://localhost:3001/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            dispatch(loginSuccess({ 
              user: {
                id: userData.id,
                email: userData.email,
                name: `${userData.firstName} ${userData.lastName}`,
                role: userData.role.toLowerCase() as 'admin' | 'mentor' | 'mentee',
              }, 
              token 
            }))
          } else {
            dispatch(setLoading(false))
          }
        } catch (error) {
          console.error('Failed to get current user:', error)
          localStorage.removeItem('token')
          dispatch(setLoading(false))
        }
      } else {
        dispatch(setLoading(false))
      }
    }

    initAuth()
  }, [dispatch])

  return <>{children}</>
}