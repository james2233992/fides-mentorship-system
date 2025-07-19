'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import socketService from '@/lib/socket'
import { addNotification } from '@/store/slices/notificationSlice'
import { updateSession } from '@/store/slices/mentorshipSlice'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect()

      // Listen for notifications
      socketService.on('notification', (notification) => {
        dispatch(addNotification({
          ...notification,
          read: false,
          createdAt: new Date().toISOString(),
        }))
      })

      // Listen for session updates
      socketService.on('session-updated', (session) => {
        dispatch(updateSession(session))
      })

      // Listen for new mentorship requests
      socketService.on('mentorship-request', (request) => {
        dispatch(addNotification({
          id: `request-${request.id}`,
          type: 'info',
          title: 'New Mentorship Request',
          message: `${request.menteeName} has sent you a mentorship request`,
          read: false,
          createdAt: new Date().toISOString(),
          action: {
            label: 'View Request',
            url: '/requests',
          },
        }))
      })
    }

    return () => {
      socketService.disconnect()
    }
  }, [isAuthenticated, dispatch])

  return <>{children}</>
}