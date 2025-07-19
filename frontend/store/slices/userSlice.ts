import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Profile {
  id: string
  name: string
  email: string
  role: 'admin' | 'mentor' | 'mentee'
  bio?: string
  skills?: string[]
  expertise?: string[]
  availability?: string[]
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface UserState {
  profile: Profile | null
  profiles: Profile[]
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  profile: null,
  profiles: [],
  loading: false,
  error: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.profile = action.payload
      state.error = null
    },
    setProfiles: (state, action: PayloadAction<Profile[]>) => {
      state.profiles = action.payload
      state.error = null
    },
    updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setUserError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    clearUserError: (state) => {
      state.error = null
    },
  },
})

export const { 
  setProfile, 
  setProfiles, 
  updateProfile, 
  setUserLoading, 
  setUserError, 
  clearUserError 
} = userSlice.actions
export default userSlice.reducer