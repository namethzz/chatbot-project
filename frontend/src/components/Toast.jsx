import React, { useEffect } from 'react'
import { Icon } from './Icons.jsx'

export default function Toast({ message, onClose, type = 'error' }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  const isError = type === 'error'

  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%',
      transform: 'translateX(-50%)',
      background: isError ? 'var(--red)' : 'var(--leaf)',
      color: '#fff',
      padding: '10px 18px',
      borderRadius: 12,
      fontSize: 13,
      zIndex: 999,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 6px 24px rgba(0,0,0,.2)',
      animation: 'fadeUp .25s ease forwards',
      maxWidth: 400, whiteSpace: 'nowrap',
    }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,.25)', border: 'none',
          color: '#fff', width: 22, height: 22, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        <Icon name="close" size={12} color="#fff" />
      </button>
    </div>
  )
}
