import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSessions, setRequests, setMentorshipLoading, setMentorshipError } from '@/store/slices/mentorshipSlice'
import { API_URL } from '@/config/api'

export function useMentorData() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const mentorshipState = useAppSelector((state) => state.mentorship)

  useEffect(() => {
    if (!user || (user.role !== 'mentor' && user.role !== 'admin')) {
      return
    }

    const fetchMentorData = async () => {
      dispatch(setMentorshipLoading(true))
      
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        // Fetch sessions
        const sessionsResponse = await fetch(`${API_URL}/sessions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json()
          // Ensure we always have an array
          dispatch(setSessions(Array.isArray(sessionsData) ? sessionsData : []))
        } else {
          console.error('Failed to fetch sessions:', sessionsResponse.status)
          dispatch(setSessions([]))
        }

        // Fetch mentorship requests
        const requestsResponse = await fetch(`${API_URL}/mentorship-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          // Ensure we always have an array
          dispatch(setRequests(Array.isArray(requestsData) ? requestsData : []))
        } else {
          console.error('Failed to fetch requests:', requestsResponse.status)
          dispatch(setRequests([]))
        }

      } catch (error) {
        console.error('Error fetching mentor data:', error)
        dispatch(setMentorshipError(error instanceof Error ? error.message : 'Failed to load data'))
        // Ensure arrays are set even on error
        dispatch(setSessions([]))
        dispatch(setRequests([]))
      } finally {
        dispatch(setMentorshipLoading(false))
      }
    }

    fetchMentorData()
  }, [user, dispatch])

  return mentorshipState
}