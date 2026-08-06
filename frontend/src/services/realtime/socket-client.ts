import { io, type Socket } from 'socket.io-client'

import { env } from '@/config/env'
import { getAccessToken } from '@/services/http/http-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socket/events.type'

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: AppSocket | null = null

export function connectSocket(): AppSocket {
  if (socket) {
    return socket
  }

  socket = io(env.socketUrl, {
    autoConnect: true,
    auth: (callback) => callback({ token: getAccessToken() }),
  })

  socket.on('connect', () => {
    console.log('[socket] connected', socket?.id)
  })

  socket.on('connect_error', (error) => {
    console.error('[socket] connect_error:', error.message)
  })

  socket.on('disconnect', (reason) => {
    console.warn('[socket] disconnected:', reason)
  })

  socket.on('app:error', (payload) => {
    console.error('[socket] app:error:', payload.code, payload.message)
  })

  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}

export function getSocket(): AppSocket | null {
  return socket
}
