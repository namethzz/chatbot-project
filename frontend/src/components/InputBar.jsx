import React, { useRef, useCallback, useState } from 'react'
import { Icon } from './Icons.jsx'
import { HINT_TAGS } from '../utils/constants.js'

export default function InputBar({ onSend, loading, cropFilter }) {
  const [value, setValue]   = useState('')
  const textareaRef         = useRef(null)
  const [focused, setFocus] = useState(false)

  // Pre-fill ถ้า cropFilter เปลี่ยน (ไม่ใช่ 'all')
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
    el.style.height = Math.min(el.scrollHeight, 130) + 'px'
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
    const cur  = value.trimEnd()
    const next = cur ? cur + ' ' + text + ' ' : text + ' '
    setValue(next)
    textareaRef.current?.focus()
    setTimeout(autoResize, 0)
  }

  const canSend = value.trim().length > 0 && !loading

  return (
    <div style={{
      borderTop: '1px solid rgba(74,44,26,.1)',
      background: 'rgba(245,239,224,.9)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      padding: '14px 28px 20px',
      flexShrink: 0,
    }}>
      {/* Input row */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        background: 'rgba(255,255,255,.92)',
        border: `1.5px solid ${focused ? 'var(--sprout)' : 'rgba(74,44,26,.16)'}`,
        borderRadius: 16,
        padding: '10px 12px 10px 16px',
        boxShadow: focused
          ? '0 2px 18px rgba(59,107,53,.13)'
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
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent', resize: 'none',
            fontSize: 14, color: 'var(--text)', lineHeight: 1.55,
            maxHeight: 130, overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Location hint button */}
          <IconBtn title="เลือกจังหวัด">
            <Icon name="pin" size={15} />
          </IconBtn>

          {/* Send button */}
          <button
            onClick={submit}
            disabled={!canSend}
            title="ส่งคำถาม (Enter)"
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: canSend ? 'var(--leaf)' : 'rgba(59,107,53,.35)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canSend ? 'pointer' : 'not-allowed',
              transition: 'all .18s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (canSend) e.currentTarget.style.background = 'var(--soil)' }}
            onMouseLeave={e => { if (canSend) e.currentTarget.style.background = 'var(--leaf)' }}
          >
            {loading
              ? <Spinner />
              : <Icon name="send" size={16} color="#fff" />
            }
          </button>
        </div>
      </div>

      {/* Hint tags */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {HINT_TAGS.map(h => (
          <HintTag key={h.label} label={h.label} onClick={() => insertHint(h.insert)} />
        ))}
        <span style={{
          marginLeft: 'auto', fontSize: 10.5, color: 'var(--hint)',
          alignSelf: 'center',
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
        width: 32, height: 32, borderRadius: 8, border: '1.5px solid',
        borderColor: h ? 'rgba(74,44,26,.3)' : 'rgba(74,44,26,.16)',
        background: h ? 'rgba(74,44,26,.06)' : 'transparent',
        color: h ? 'var(--earth)' : 'var(--hint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
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
        padding: '4px 9px', borderRadius: 8,
        border: `1px solid ${h ? 'var(--sprout)' : 'rgba(74,44,26,.13)'}`,
        background: h ? 'rgba(59,107,53,.08)' : 'rgba(255,255,255,.72)',
        color: h ? 'var(--leaf)' : 'var(--muted)',
        fontSize: 11, cursor: 'pointer', transition: 'all .15s',
      }}
    >
      {label}
    </button>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); transform-origin: center; } }`}</style>
    </svg>
  )
}
