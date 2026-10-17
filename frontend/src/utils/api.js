import * as demo from './demoApi.js'

// โหมดเดโม: ใช้คำตอบตัวอย่างในเบราว์เซอร์ ไม่ต้องมี backend (ดู demoApi.js)
export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

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

const live = {
  // ─── Sessions ─────────────────────────────────────────
  getSessions:   ()        => request('/sessions'),
  createSession: ()        => request('/sessions', { method: 'POST' }),
  getSession:    (id)      => request('/sessions/' + id),
  renameSession: (id, t)   => request('/sessions/' + id + '/title', { method: 'PATCH', body: JSON.stringify({ title: t }) }),
  deleteSession: (id)      => request('/sessions/' + id, { method: 'DELETE' }),

  // ─── Chat ─────────────────────────────────────────────
  sendMessage:   (q, sid)  => request('/ask', { method: 'POST', body: JSON.stringify({ question: q, sessionId: sid }) }),

  // ─── Stats ────────────────────────────────────────────
  getStats:      ()        => request('/stats'),

  // ─── Health ───────────────────────────────────────────
  healthCheck:   ()        => request('/health'),
}

export const {
  getSessions, createSession, getSession, renameSession, deleteSession,
  sendMessage, getStats, healthCheck,
} = isDemo ? demo : live
