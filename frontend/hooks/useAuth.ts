import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { loginSuccess, logout, setLoading } from '@/store/slices/authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        dispatch(setLoading(false))
        return
      }

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
              name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              bio: userData.bio,
              expertise: userData.expertise,
            }, 
            token 
          }))
        } else {
          localStorage.removeItem('token')
          dispatch(logout())
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        dispatch(logout())
      } finally {
        dispatch(setLoading(false))
      }
    }

    checkAuth()
  }, [dispatch])
}