import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MentorshipSession {
  id: string
  mentorId: string
  menteeId: string
  mentorName: string
  menteeName: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  meetingLink?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface MentorshipRequest {
  id: string
  mentorId: string
  menteeId: string
  mentorName: string
  menteeName: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
}

interface MentorshipState {
  sessions: MentorshipSession[]
  requests: MentorshipRequest[]
  currentSession: MentorshipSession | null
  loading: boolean
  error: string | null
}

const initialState: MentorshipState = {
  sessions: [],
  requests: [],
  currentSession: null,
  loading: false,
  error: null,
}

export const mentorshipSlice = createSlice({
  name: 'mentorship',
  initialState,
  reducers: {
    setSessions: (state, action: PayloadAction<MentorshipSession[]>) => {
      state.sessions = action.payload
      state.error = null
    },
    addSession: (state, action: PayloadAction<MentorshipSession>) => {
      state.sessions.push(action.payload)
    },
    updateSession: (state, action: PayloadAction<MentorshipSession>) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.sessions[index] = action.payload
      }
    },
    removeSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload)
    },
    setCurrentSession: (state, action: PayloadAction<MentorshipSession | null>) => {
      state.currentSession = action.payload
    },
    setRequests: (state, action: PayloadAction<MentorshipRequest[]>) => {
      state.requests = action.payload
      state.error = null
    },
    addRequest: (state, action: PayloadAction<MentorshipRequest>) => {
      state.requests.push(action.payload)
    },
    updateRequest: (state, action: PayloadAction<MentorshipRequest>) => {
      const index = state.requests.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.requests[index] = action.payload
      }
    },
    setMentorshipLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setMentorshipError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const {
  setSessions,
  addSession,
  updateSession,
  removeSession,
  setCurrentSession,
  setRequests,
  addRequest,
  updateRequest,
  setMentorshipLoading,
  setMentorshipError,
} = mentorshipSlice.actions
export default mentorshipSlice.reducer