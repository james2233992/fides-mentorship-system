import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  role: 'admin' | 'mentor' | 'mentee'
  avatar?: string
  profilePicture?: string
  bio?: string
  expertise?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get('token') || null,
  isAuthenticated: false,
  loading: true,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false
      Cookies.set('token', action.payload.token, { expires: 7 })
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      Cookies.remove('token')
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { loginSuccess, logout, updateUser, setLoading } = authSlice.actions
export default authSlice.reducer