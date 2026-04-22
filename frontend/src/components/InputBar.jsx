import React, { useRef, useCallback, useState } from 'react'
import { Icon } from './Icons.jsx'
import { HINT_TAGS } from '../utils/constants.js'

export default function InputBar({ onSend, loading, cropFilter }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)
  const [focused, setFocus] = useState(false)

  React.useEffect(() => {
    if (cropFilter && cropFilter !== 'all') {
      setValue(cropFilter + ' ')
      textareaRef.current?.focus()
    }
  }, [cropFilter])

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [])

  function handleChange(e) {
    setValue(e.target.value)
    autoResize()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const q = value.trim()
    if (!q || loading) return
    onSend(q)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function insertHint(text) {
    const cur = value.trimEnd()
    const next = cur ? cur + ' ' + text + ' ' : text + ' '
    setValue(next)
    textareaRef.current?.focus()
    setTimeout(autoResize, 0)
  }

  const canSend = value.trim().length > 0 && !loading

  return (
    <div style={{
      borderTop: '1px solid rgba(74,44,26,.08)',
      background: 'rgba(245,239,224,.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      padding: '18px 28px 22px',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
        background: 'rgba(255,255,255,.96)',
        border: `1.5px solid ${focused ? 'var(--sprout)' : 'rgba(74,44,26,.14)'}`,
        borderRadius: 20,
        padding: '14px 14px 14px 18px',
        boxShadow: focused
          ? '0 6px 24px rgba(59,107,53,.12)'
          : 'var(--sh-sm)',
        transition: 'border-color .2s, box-shadow .2s',
      }}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder="ถามเรื่องพืชเศรษฐกิจไทย เช่น 'ทุเรียนปลูกได้ที่ระยองไหม'"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: 17,
            color: 'var(--text)',
            lineHeight: 1.7,
            maxHeight: 180,
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <IconBtn title="เลือกจังหวัด">
            <Icon name="pin" size={17} />
          </IconBtn>

          <button
            onClick={submit}
            disabled={!canSend}
            title="ส่งคำถาม (Enter)"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: 'none',
              background: canSend ? 'linear-gradient(135deg, var(--leaf), var(--sprout))' : 'rgba(59,107,53,.35)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canSend ? 'pointer' : 'not-allowed',
              transition: 'all .18s',
              flexShrink: 0,
              boxShadow: canSend ? '0 8px 18px rgba(59,107,53,.18)' : 'none',
            }}
          >
            {loading ? <Spinner /> : <Icon name="send" size={18} color="#fff" />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        {HINT_TAGS.map(h => (
          <HintTag key={h.label} label={h.label} onClick={() => insertHint(h.insert)} />
        ))}
        <span style={{
          marginLeft: 'auto',
          fontSize: 12,
          color: 'var(--hint)',
          alignSelf: 'center',
          fontWeight: 500,
        }}>
          Enter ส่ง · Shift+Enter ขึ้นบรรทัด
        </span>
      </div>
    </div>
  )
}

function IconBtn({ children, title }) {
  const [h, setH] = useState(false)

  return (
    <button
      title={title}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: '1.5px solid',
        borderColor: h ? 'rgba(74,44,26,.28)' : 'rgba(74,44,26,.14)',
        background: h ? 'rgba(74,44,26,.05)' : 'transparent',
        color: h ? 'var(--earth)' : 'var(--hint)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all .15s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

function HintTag({ label, onClick }) {
  const [h, setH] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: '7px 12px',
        borderRadius: 10,
        border: `1px solid ${h ? 'var(--sprout)' : 'rgba(74,44,26,.12)'}`,
        background: h ? 'rgba(59,107,53,.08)' : 'rgba(255,255,255,.76)',
        color: h ? 'var(--leaf)' : 'var(--muted)',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all .15s',
      }}
    >
      {label}
    </button>
  )
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path
        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); transform-origin: center; } }`}</style>
    </svg>
  )
}