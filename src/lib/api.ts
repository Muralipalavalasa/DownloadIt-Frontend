import type { MediaAnalyzeResponse } from '../types/media'
import type { DownloadHistoryItem, DownloadJobCreated, DownloadJobStatus } from '../types/download'
import { getAccessToken } from './authStorage'

export interface UserResponse {
  id: string
  email: string
  created_at: string
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: 'bearer'
}

const getApiBaseUrl = (): string => {
  const configuredValue = import.meta.env.VITE_API_BASE_URL
  return configuredValue && configuredValue.trim() ? configuredValue.trim() : 'http://localhost:8000'
}

const fetchApi = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(input, init)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to DownloadIt. Check the API connection and try again.')
    }
    throw error
  }
}

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json()

    if (typeof payload?.detail === 'string') {
      return payload.detail
    }

    if (payload?.detail && typeof payload.detail === 'object') {
      if (typeof payload.detail.message === 'string') {
        return payload.detail.message
      }
      if (typeof payload.detail.error === 'string') {
        return payload.detail.error
      }
      if (payload.detail.database === 'unavailable') {
        return 'Download service is temporarily unavailable.'
      }
    }

    if (Array.isArray(payload?.detail)) {
      return payload.detail.map((issue: { msg?: string }) => issue.msg).filter(Boolean).join(' ')
    }

    if (typeof payload?.message === 'string') {
      return payload.message
    }
  } catch {
    // Ignore parse errors and fall back to the default message.
  }

  if (response.status === 400) {
    return 'This platform is currently unsupported.'
  }

  if (response.status >= 500) {
    return 'Download service is temporarily unavailable.'
  }

  return 'Unable to connect to DownloadIt server. Please make sure the backend is running.'
}

export const analyzeMedia = async (url: string): Promise<MediaAnalyzeResponse> => {
  const apiBaseUrl = getApiBaseUrl()

  try {
    const response = await fetchApi(`${apiBaseUrl}/api/media/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error(await getErrorMessage(response))
    }

    const payload = (await response.json()) as MediaAnalyzeResponse
    return payload
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('Unable to connect to DownloadIt. Check the API connection and try again.')
  }
}

export const getDownloadHistory = async (): Promise<DownloadHistoryItem[]> => {
  try {
    const token = getAccessToken()
    const response = await fetchApi(`${getApiBaseUrl()}/api/downloads`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!response.ok) {
      throw new Error(await getErrorMessage(response))
    }

    return (await response.json()) as DownloadHistoryItem[]
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('Unable to connect to DownloadIt. Check the API connection and try again.')
  }
}

export const register = async (email: string, password: string): Promise<UserResponse> => {
  const response = await fetchApi(`${getApiBaseUrl()}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  return (await response.json()) as UserResponse
}

export const login = async (email: string, password: string): Promise<TokenResponse> => {
  const response = await fetchApi(`${getApiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  return (await response.json()) as TokenResponse
}

export const getCurrentUser = async (): Promise<UserResponse> => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Please sign in to continue.')
  }

  const response = await fetchApi(`${getApiBaseUrl()}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  return (await response.json()) as UserResponse
}

const getAuthorizationHeaders = (): Record<string, string> => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Please sign in to continue.')
  }
  return { Authorization: `Bearer ${token}` }
}

export const createDownload = async (
  sourceUrl: string,
  format: string,
  quality: string,
  authorizedToDownload = false,
): Promise<DownloadJobCreated> => {
  const response = await fetchApi(`${getApiBaseUrl()}/api/downloads`, {
    method: 'POST',
    headers: { ...getAuthorizationHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_url: sourceUrl, format, quality, authorized_to_download: authorizedToDownload }),
  })
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  return (await response.json()) as DownloadJobCreated
}

export const getDownloadStatus = async (downloadId: string): Promise<DownloadJobStatus> => {
  const response = await fetchApi(`${getApiBaseUrl()}/api/downloads/${downloadId}/status`, {
    headers: getAuthorizationHeaders(),
  })
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  return (await response.json()) as DownloadJobStatus
}

export const getDownloadFile = async (downloadId: string): Promise<Blob> => {
  const response = await fetchApi(`${getApiBaseUrl()}/api/downloads/${downloadId}/file`, {
    headers: getAuthorizationHeaders(),
  })
  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
  return response.blob()
}
