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
    auth: () => ({ token: getAccessToken() }),
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
