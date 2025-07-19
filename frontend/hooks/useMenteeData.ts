import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSessions, setRequests, setMentorshipLoading, setMentorshipError } from '@/store/slices/mentorshipSlice'
import { API_URL } from '@/config/api'

export function useMenteeData() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const mentorshipState = useAppSelector((state) => state.mentorship)

  useEffect(() => {
    if (!user || user.role !== 'mentee') {
      return
    }

    const fetchMenteeData = async () => {
      dispatch(setMentorshipLoading(true))
      
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        // Fetch sessions for mentee
        const sessionsResponse = await fetch(`${API_URL}/sessions?menteeId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json()
          dispatch(setSessions(Array.isArray(sessionsData) ? sessionsData : []))
        } else {
          console.error('Failed to fetch sessions:', sessionsResponse.status)
          dispatch(setSessions([]))
        }

        // Fetch mentorship requests for mentee
        const requestsResponse = await fetch(`${API_URL}/mentorship-requests?menteeId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          dispatch(setRequests(Array.isArray(requestsData) ? requestsData : []))
        } else {
          console.error('Failed to fetch requests:', requestsResponse.status)
          dispatch(setRequests([]))
        }

      } catch (error) {
        console.error('Error fetching mentee data:', error)
        dispatch(setMentorshipError(error instanceof Error ? error.message : 'Failed to load data'))
        dispatch(setSessions([]))
        dispatch(setRequests([]))
      } finally {
        dispatch(setMentorshipLoading(false))
      }
    }

    fetchMenteeData()
  }, [user, dispatch])

  return mentorshipState
}