import React, { useState } from 'react'
import { Icon } from './Icons.jsx'
import { HISTORY_ICON } from '../utils/constants.js'

export default function Sidebar({ sessions, currentId, onSelect, onNew, onDelete, onRename, stats }) {
  return (
    <aside style={{
      width: 248, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(74,44,26,.1)',
      background: 'rgba(245,239,224,.52)',
      overflow: 'hidden',
    }}>
      {/* Section label */}
      <div style={{ padding: '16px 16px 6px' }}>
        <span style={{
          fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em',
          color: 'var(--hint)', fontWeight: 600,
        }}>
          ประวัติการสนทนา
        </span>
      </div>

      {/* Session list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {sessions.length === 0 && (
          <p style={{ padding: '16px 10px', fontSize: 12, color: 'var(--hint)', textAlign: 'center', lineHeight: 1.6 }}>
            ยังไม่มีประวัติ<br />เริ่มสนทนาใหม่ด้านล่าง
          </p>
        )}
        {sessions.map(s => (
          <SessionItem
            key={s._id}
            session={s}
            isActive={s._id === currentId}
            onSelect={() => onSelect(s._id)}
            onDelete={() => onDelete(s._id)}
            onRename={(t) => onRename(s._id, t)}
          />
        ))}
      </div>

      {/* New chat button */}
      <div style={{ padding: '8px 16px' }}>
        <NewChatBtn onClick={onNew} />
      </div>

      <div style={{ height: 1, background: 'rgba(74,44,26,.09)', margin: '0 16px' }} />

      {/* Info card */}
      <div style={{ padding: '10px 16px 16px' }}>
        <InfoCard stats={stats} />
      </div>
    </aside>
  )
}

// ─── Session Item ─────────────────────────────────────────
function SessionItem({ session, isActive, onSelect, onDelete, onRename }) {
  const [hovered, setHovered]   = useState(false)
  const [editing, setEditing]   = useState(false)
  const [editVal, setEditVal]   = useState(session.title)

  // Determine icon from cropFocus or messages intent
  const iconCfg = HISTORY_ICON['guide'] // default; real app gets from session.cropFocus

  function commitRename() {
    if (editVal.trim() && editVal.trim() !== session.title) {
      onRename(editVal.trim())
    }
    setEditing(false)
  }

  return (
    <div
      onClick={() => !editing && onSelect()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        padding: '9px 10px', borderRadius: 10, cursor: 'pointer',
        marginBottom: 2, transition: 'background .15s',
        background: isActive
          ? 'rgba(59,107,53,.13)'
          : hovered ? 'rgba(59,107,53,.07)' : 'transparent',
        position: 'relative',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 29, height: 29, borderRadius: 8, flexShrink: 0,
        background: iconCfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, marginTop: 1,
      }}>
        {iconCfg.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input
            autoFocus
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false) }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', border: '1px solid var(--sprout)', borderRadius: 5,
              padding: '2px 6px', fontSize: 12, color: 'var(--text)',
              background: '#fff', outline: 'none',
            }}
          />
        ) : (
          <div style={{
            fontSize: 12, color: 'var(--text)', lineHeight: 1.45,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {session.title}
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--hint)', marginTop: 2 }}>
          {session.msgCount} ข้อความ ·{' '}
          {new Date(session.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* Actions (show on hover) */}
      {hovered && !editing && (
        <div style={{ display: 'flex', gap: 2, flexShrink: 0, marginTop: 2 }}>
          <ActionBtn title="เปลี่ยนชื่อ" onClick={e => { e.stopPropagation(); setEditing(true) }}>
            <Icon name="edit" size={12} />
          </ActionBtn>
          <ActionBtn title="ลบ" onClick={e => { e.stopPropagation(); onDelete() }} danger>
            <Icon name="trash" size={12} />
          </ActionBtn>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ children, onClick, title, danger }) {
  const [h, setH] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 22, height: 22, borderRadius: 6, border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: h
          ? (danger ? 'rgba(155,43,26,.15)' : 'rgba(74,44,26,.08)')
          : 'transparent',
        color: h
          ? (danger ? 'var(--red)' : 'var(--earth)')
          : 'var(--hint)',
        transition: 'all .14s',
      }}
    >
      {children}
    </button>
  )
}

// ─── New Chat Button ──────────────────────────────────────
function NewChatBtn({ onClick }) {
  const [h, setH] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: '100%', padding: '9px 0', borderRadius: 10,
        border: `1.5px dashed ${h ? 'var(--sprout)' : 'rgba(59,107,53,.35)'}`,
        background: h ? 'rgba(59,107,53,.08)' : 'transparent',
        color: 'var(--sprout)', fontSize: 12.5, fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'all .18s',
      }}
    >
      <Icon name="plus" size={14} color="var(--sprout)" />
      สนทนาใหม่
    </button>
  )
}

// ─── Info Card ────────────────────────────────────────────
function InfoCard({ stats }) {
  return (
    <div style={{
      padding: 12, borderRadius: 12,
      background: 'linear-gradient(135deg,rgba(59,107,53,.08),rgba(184,212,232,.1))',
      border: '1px solid rgba(59,107,53,.16)',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'var(--leaf)',
        marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <Icon name="info" size={11} color="var(--leaf)" />
        ถามได้เรื่อง
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.75 }}>
        {['ที่ดิน', 'วิธีปลูก', 'ศัตรูพืช'].map(t => (
          <span key={t} style={{
            display: 'inline-block',
            background: 'rgba(59,107,53,.11)', color: 'var(--leaf)',
            borderRadius: 4, padding: '1px 5px', fontSize: 10,
            fontWeight: 600, margin: '1px 2px',
          }}>{t}</span>
        ))}
        {' '}ครอบคลุม 14 พืชเศรษฐกิจ รวม<br />กาแฟโรบัสต้า · กาแฟอาราบิก้า
      </div>
      {stats && (
        <div style={{
          marginTop: 8, paddingTop: 8,
          borderTop: '1px solid rgba(74,44,26,.09)',
          fontSize: 10.5, color: 'var(--hint)',
          display: 'flex', gap: 12,
        }}>
          <span>{stats.totalSessions} session</span>
          <span>{stats.totalMessages} ข้อความ</span>
          {stats.todayAsked > 0 && <span>วันนี้ {stats.todayAsked} ถาม</span>}
        </div>
      )}
    </div>
  )
}
