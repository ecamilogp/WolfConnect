import { z } from 'zod'

/**
 * Validated, typed access to Vite's environment variables.
 *
 * Mirrors the backend's fail-fast `config/env.ts` pattern: if a required
 * variable is missing or malformed, the app throws immediately instead of
 * failing later with a confusing runtime error deep inside a service.
 *
 * Every module that needs to reach the backend (HTTP client, Socket.IO
 * client, etc.) must read configuration from here instead of touching
 * `import.meta.env` directly.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1, 'VITE_API_BASE_URL is required'),
  VITE_SOCKET_URL: z.string().url('VITE_SOCKET_URL must be a valid URL'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment configuration. Check your .env file against .env.example.')
}

export const env = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  socketUrl: parsed.data.VITE_SOCKET_URL,
} as const
