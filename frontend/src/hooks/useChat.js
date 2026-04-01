import { useState, useEffect, useRef, useCallback } from 'react'
import * as api from '../utils/api.js'

export function useChat() {
  const [sessions,   setSessions]   = useState([])
  const [currentId,  setCurrentId]  = useState(null)   // MongoDB _id ของ session ปัจจุบัน
  const [messages,   setMessages]   = useState([])
  const [loading,    setLoading]    = useState(false)
  const [stats,      setStats]      = useState(null)
  const [backendOk,  setBackendOk]  = useState(null)   // null=checking true=ok false=down
  const [error,      setError]      = useState(null)

  const bottomRef = useRef(null)

  // ─── Init ───────────────────────────────────────────
  useEffect(() => {
    checkBackend()
    loadSessions()
    loadStats()
    const t = setInterval(loadStats, 30_000)
    return () => clearInterval(t)
  }, [])

  // ─── Scroll to bottom when messages change ──────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ─── Functions ──────────────────────────────────────
  async function checkBackend() {
    try {
      await api.healthCheck()
      setBackendOk(true)
    } catch {
      setBackendOk(false)
    }
  }

  async function loadSessions() {
    try {
      const data = await api.getSessions()
      setSessions(data)
    } catch { /* backend อาจยังไม่รัน */ }
  }

  async function loadStats() {
    try {
      const data = await api.getStats()
      setStats(data)
    } catch { /* ไม่แสดง error */ }
  }

  async function selectSession(id) {
    try {
      const s = await api.getSession(id)
      setCurrentId(id)
      setMessages(s.messages || [])
      setError(null)
    } catch (e) {
      setError('โหลด session ไม่สำเร็จ: ' + e.message)
    }
  }

  function newSession() {
    setCurrentId(null)
    setMessages([])
    setError(null)
  }

  async function deleteSession(id) {
    try {
      await api.deleteSession(id)
      setSessions(prev => prev.filter(s => s._id !== id))
      if (currentId === id) newSession()
    } catch (e) {
      setError('ลบไม่สำเร็จ: ' + e.message)
    }
  }

  async function renameSession(id, title) {
    try {
      const updated = await api.renameSession(id, title)
      setSessions(prev => prev.map(s => s._id === id ? { ...s, title: updated.title } : s))
    } catch (e) {
      setError('เปลี่ยนชื่อไม่สำเร็จ: ' + e.message)
    }
  }

  const send = useCallback(async (question) => {
    const q = question.trim()
    if (!q || loading) return

    setLoading(true)
    setError(null)

    // Optimistic user bubble
    const tempId = 'tmp_' + Date.now()
    setMessages(prev => [...prev, { _id: tempId, role: 'user', content: q }])

    try {
      const data = await api.sendMessage(q, currentId)

      // Replace optimistic + add bot reply
      setMessages(prev => [
        ...prev.filter(m => m._id !== tempId),
        data.userMsg,
        data.botMsg,
      ])

      // Update session id if new
      if (!currentId && data.sessionId) setCurrentId(data.sessionId)

      // Refresh lists
      loadSessions()
      loadStats()
    } catch (e) {
      // Remove optimistic bubble, show error
      setMessages(prev => prev.filter(m => m._id !== tempId))
      setError('ส่งข้อความไม่สำเร็จ: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [loading, currentId])

  return {
    // state
    sessions, currentId, messages, loading, stats, backendOk, error,
    // refs
    bottomRef,
    // actions
    selectSession, newSession, deleteSession, renameSession, send,
    setError,
  }
}
