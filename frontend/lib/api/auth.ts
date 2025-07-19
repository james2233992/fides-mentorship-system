import axiosInstance from './axios'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'mentor' | 'mentee'
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'mentor' | 'mentee'
    avatar?: string
  }
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post('/auth/login', credentials)
    return data
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post('/auth/register', userData)
    return data
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout')
  },

  getCurrentUser: async () => {
    const { data } = await axiosInstance.get('/auth/profile')
    return data
  },

  refreshToken: async () => {
    const { data } = await axiosInstance.post('/auth/refresh')
    return data
  },
}