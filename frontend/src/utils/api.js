// ตอนพัฒนาในเครื่องใช้ proxy ของ Vite (/api → localhost:4000)
// ตอน deploy ตั้ง VITE_API_URL เป็น URL ของ backend เช่น https://xxx.onrender.com
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Sessions ─────────────────────────────────────────
export const getSessions   = ()        => request('/sessions')
export const createSession = ()        => request('/sessions', { method: 'POST' })
export const getSession    = (id)      => request('/sessions/' + id)
export const renameSession = (id, t)   => request('/sessions/' + id + '/title', { method: 'PATCH', body: JSON.stringify({ title: t }) })
export const deleteSession = (id)      => request('/sessions/' + id, { method: 'DELETE' })

// ─── Chat ─────────────────────────────────────────────
export const sendMessage   = (q, sid) => request('/ask', { method: 'POST', body: JSON.stringify({ question: q, sessionId: sid }) })

// ─── Stats ────────────────────────────────────────────
export const getStats      = ()        => request('/stats')

// ─── Health ───────────────────────────────────────────
export const healthCheck   = ()        => request('/health')
