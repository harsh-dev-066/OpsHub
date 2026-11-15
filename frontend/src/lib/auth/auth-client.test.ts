import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { apiClient, ApiError } from '@/lib/api/client'
import {
  AUTH_EXPIRED_EVENT,
  readAuthSession,
  writeAuthSession,
} from '@/lib/auth/token-storage'
import { server } from '@/mocks/server'

function seedSession(access: string, refresh = 'mock-refresh.user-001') {
  writeAuthSession({
    username: 'test',
    access,
    refresh,
    authenticatedAt: new Date().toISOString(),
  })
}

describe('apiClient authentication', () => {
  it('sends the bearer token', async () => {
    seedSession('mock-access.user-001')
    const me = await apiClient<{ username: string }>('/api/auth/me')
    expect(me.username).toBe('test')
  })

  it('refreshes once on 401 and retries with the new token', async () => {
    seedSession('expired-token')
    const refreshSpy = vi.fn()
    server.use(
      http.post('/api/auth/refresh', () => {
        refreshSpy()
        return HttpResponse.json({
          access: 'mock-access.user-001',
          refresh: 'mock-refresh.user-001-rotated',
        })
      }),
    )

    const [a, b] = await Promise.all([
      apiClient<{ username: string }>('/api/auth/me'),
      apiClient<{ username: string }>('/api/auth/me'),
    ])

    expect(a.username).toBe('test')
    expect(b.username).toBe('test')
    expect(refreshSpy).toHaveBeenCalledTimes(1)
    expect(readAuthSession()?.access).toBe('mock-access.user-001')
    expect(readAuthSession()?.refresh).toBe('mock-refresh.user-001-rotated')
  })

  it('clears the session and signals expiry when refresh fails', async () => {
    seedSession('expired-token', 'revoked-refresh')
    const onExpired = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)

    await expect(apiClient('/api/auth/me')).rejects.toBeInstanceOf(ApiError)

    expect(readAuthSession()).toBeNull()
    expect(onExpired).toHaveBeenCalledTimes(1)
    window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  })

  it('does not attempt a refresh for anonymous calls', async () => {
    const refreshSpy = vi.fn()
    server.use(
      http.post('/api/auth/refresh', () => {
        refreshSpy()
        return HttpResponse.json({}, { status: 401 })
      }),
    )

    await expect(
      apiClient(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username: 'test', password: 'nope' }),
        },
        { auth: false },
      ),
    ).rejects.toMatchObject({ status: 401 })
    expect(refreshSpy).not.toHaveBeenCalled()
  })
})

describe('apiClient non-JSON responses', () => {
  it('reports a starting-up server instead of a JSON parse error', async () => {
    server.use(
      http.get(
        '/api/dashboard/summary',
        () =>
          new HttpResponse('<html>Service waking up</html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }),
      ),
    )
    seedSession('mock-access.user-001')

    await expect(apiClient('/api/dashboard/summary')).rejects.toMatchObject({
      status: 503,
      message: expect.stringMatching(/starting up/i),
    })
  })
})
