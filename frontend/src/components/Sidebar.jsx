import React, { useState } from 'react'
import { Icon } from './Icons.jsx'
import { HISTORY_ICON } from '../utils/constants.js'

export default function Sidebar({ sessions, currentId, onSelect, onNew, onDelete, onRename, stats }) {
  return (
    <aside style={{
      width: 290,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(74,44,26,.08)',
      background: 'rgba(245,239,224,.58)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 18px 8px' }}>
        <span style={{
          fontSize: 12,
          letterSpacing: '.05em',
          color: 'var(--hint)',
          fontWeight: 700,
        }}>
          ประวัติการสนทนา
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
        {sessions.length === 0 && (
          <p style={{
            padding: '18px 12px',
            fontSize: 14,
            color: 'var(--hint)',
            textAlign: 'center',
            lineHeight: 1.8,
          }}>
            ยังไม่มีประวัติการสนทนา<br />เริ่มถามคำถามใหม่ได้ด้านล่าง
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

      <div style={{ padding: '10px 18px' }}>
        <NewChatBtn onClick={onNew} />
      </div>

      <div style={{ height: 1, background: 'rgba(74,44,26,.08)', margin: '0 18px' }} />

      <div style={{ padding: '12px 18px 18px' }}>
        <InfoCard stats={stats} />
      </div>
    </aside>
  )
}

function SessionItem({ session, isActive, onSelect, onDelete, onRename }) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(session.title)

  const iconCfg = HISTORY_ICON['guide']

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
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 12px',
        borderRadius: 14,
        cursor: 'pointer',
        marginBottom: 4,
        transition: 'background .15s',
        background: isActive
          ? 'rgba(59,107,53,.13)'
          : hovered ? 'rgba(59,107,53,.06)' : 'transparent',
        position: 'relative',
      }}
    >
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        flexShrink: 0,
        background: iconCfg.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        marginTop: 1,
      }}>
        {iconCfg.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input
            autoFocus
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') setEditing(false)
            }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              border: '1px solid var(--sprout)',
              borderRadius: 8,
              padding: '6px 8px',
              fontSize: 14,
              color: 'var(--text)',
              background: '#fff',
              outline: 'none',
            }}
          />
        ) : (
          <div style={{
            fontSize: 14.5,
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1.55,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {session.title}
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--hint)', marginTop: 4 }}>
          {session.msgCount} ข้อความ ·{' '}
          {new Date(session.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
        </div>
      </div>

      {hovered && !editing && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginTop: 2 }}>
          <ActionBtn title="เปลี่ยนชื่อ" onClick={e => { e.stopPropagation(); setEditing(true) }}>
            <Icon name="edit" size={13} />
          </ActionBtn>
          <ActionBtn title="ลบ" onClick={e => { e.stopPropagation(); onDelete() }} danger>
            <Icon name="trash" size={13} />
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
        width: 26,
        height: 26,
        borderRadius: 8,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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

function NewChatBtn({ onClick }) {
  const [h, setH] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: '100%',
        padding: '12px 0',
        borderRadius: 14,
        border: `1.5px dashed ${h ? 'var(--sprout)' : 'rgba(59,107,53,.35)'}`,
        background: h ? 'rgba(59,107,53,.08)' : 'transparent',
        color: 'var(--sprout)',
        fontSize: 14,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all .18s',
      }}
    >
      <Icon name="plus" size={16} color="var(--sprout)" />
      สนทนาใหม่
    </button>
  )
}

function InfoCard({ stats }) {
  return (
    <div style={{
      padding: 14,
      borderRadius: 14,
      background: 'linear-gradient(135deg,rgba(59,107,53,.08),rgba(184,212,232,.10))',
      border: '1px solid rgba(59,107,53,.14)',
    }}>
      <div style={{
        fontSize: 12.5,
        fontWeight: 700,
        color: 'var(--leaf)',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <Icon name="info" size={13} color="var(--leaf)" />
        ถามได้เรื่อง
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.8 }}>
        {['ที่ดิน', 'วิธีปลูก', 'ศัตรูพืช'].map(t => (
          <span key={t} style={{
            display: 'inline-block',
            background: 'rgba(59,107,53,.11)',
            color: 'var(--leaf)',
            borderRadius: 6,
            padding: '2px 7px',
            fontSize: 11.5,
            fontWeight: 700,
            margin: '2px 3px',
          }}>
            {t}
          </span>
        ))}
        {' '}ครอบคลุม 14 พืชเศรษฐกิจ รวมกาแฟโรบัสต้า และกาแฟอาราบิก้า
      </div>

      {stats && (
        <div style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid rgba(74,44,26,.08)',
          fontSize: 11.5,
          color: 'var(--hint)',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <span>{stats.totalSessions} session</span>
          <span>{stats.totalMessages} ข้อความ</span>
          {stats.todayAsked > 0 && <span>วันนี้ {stats.todayAsked} ถาม</span>}
        </div>
      )}
    </div>
  )
}