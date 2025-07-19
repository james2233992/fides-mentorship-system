import { io, Socket } from 'socket.io-client'
import Cookies from 'js-cookie'

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class SocketService {
  private socket: Socket | null = null

  connect() {
    const token = Cookies.get('token')
    
    if (!token) {
      console.error('No token found, cannot connect to socket')
      return
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
    })

    this.socket.on('connect', () => {
      console.log('Connected to socket server')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  joinRoom(roomId: string) {
    this.emit('join-room', roomId)
  }

  leaveRoom(roomId: string) {
    this.emit('leave-room', roomId)
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export default new SocketService()