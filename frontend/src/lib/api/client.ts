import {
  AUTH_EXPIRED_EVENT,
  clearAuthSession,
  readAuthSession,
  updateAuthTokens,
} from '@/lib/auth/token-storage'
import { API_BASE_URL } from '@/lib/env'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface ApiClientOptions {
  /** Attach the bearer token and refresh on 401. Off for login/logout. */
  auth?: boolean
}

let refreshInFlight: Promise<string | null> | null = null

/**
 * Exchanges the stored refresh token for a new pair. Concurrent callers share
 * one request, so a burst of 401s triggers a single refresh (the backend
 * rotates and blacklists refresh tokens, so parallel refreshes would race).
 */
function refreshAccessToken(): Promise<string | null> {
  const refresh = readAuthSession()?.refresh
  if (!refresh) return Promise.resolve(null)

  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (!response.ok) return null
      const tokens = (await response.json()) as {
        access: string
        refresh?: string
      }
      updateAuthTokens(tokens.access, tokens.refresh)
      return tokens.access
    } catch {
      return null
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

function expireSession() {
  clearAuthSession()
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}

function send(path: string, init: RequestInit | undefined, token?: string) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  })
}

async function toApiError(response: Response) {
  let message = 'Something went wrong. Please try again.'
  try {
    const body = (await response.json()) as { message?: string }
    if (body.message) message = body.message
  } catch {
    // ignore parse failures
  }
  return new ApiError(message, response.status)
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
  { auth = true }: ApiClientOptions = {},
): Promise<T> {
  const token = auth ? readAuthSession()?.access : undefined
  let response = await send(path, init, token)

  if (response.status === 401 && token) {
    const nextToken = await refreshAccessToken()
    if (nextToken) {
      response = await send(path, init, nextToken)
    }
    if (response.status === 401) {
      expireSession()
    }
  }

  if (!response.ok) {
    throw await toApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function toSearchParams(
  params: Record<string, string | number | undefined | null> | object,
) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}
