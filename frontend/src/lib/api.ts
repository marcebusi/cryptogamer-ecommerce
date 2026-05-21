/* Centralised API helper — adds auth header automatically */
import { normalizeImgUrl } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

async function request<T = unknown>(
  path: string,
  method: Method = 'GET',
  body?: unknown,
): Promise<T> {
  const token = localStorage.getItem('cg_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? `HTTP ${res.status}`)
  }

  return data as T
}

export const api = {
  get:    <T>(path: string)                 => request<T>(path, 'GET'),
  post:   <T>(path: string, body: unknown)  => request<T>(path, 'POST',   body),
  put:    <T>(path: string, body: unknown)  => request<T>(path, 'PUT',    body),
  patch:  <T>(path: string, body: unknown)  => request<T>(path, 'PATCH',  body),
  delete: <T>(path: string)                 => request<T>(path, 'DELETE'),

  /** Upload a file (multipart/form-data) — auth header added automatically */
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const token = localStorage.getItem('cg_token')
    const form  = new FormData()
    form.append('image', file)
    const res = await fetch(`${BASE}/api/upload/image`, {
      method:  'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    form,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error((data as { message?: string }).message ?? `HTTP ${res.status}`)
    const raw = data as { url: string }
    return { url: normalizeImgUrl(raw.url) }
  },
}
