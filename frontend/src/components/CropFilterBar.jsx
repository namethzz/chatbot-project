import React from 'react'
import { CROPS } from '../utils/constants.js'

export default function CropFilterBar({ active, onSelect }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 28px',
      overflowX: 'auto',
      flexShrink: 0,
      borderBottom: '1px solid rgba(74,44,26,.08)',
      background: 'rgba(245,239,224,.72)',
      scrollbarWidth: 'none',
      position: 'relative',
      zIndex: 10,
    }}>
      <span style={{
        fontSize: 12,
        color: 'var(--hint)',
        whiteSpace: 'nowrap',
        fontWeight: 700,
        letterSpacing: '.05em',
        flexShrink: 0,
        marginRight: 2,
      }}>
        พืช :
      </span>

      {CROPS.map(c => {
        const isActive = active === c.key
        return (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              cursor: 'pointer',
              transition: 'all .18s ease',
              border: isActive
                ? '1.5px solid var(--leaf)'
                : '1.5px solid rgba(74,44,26,.12)',
              background: isActive ? 'var(--leaf)' : 'rgba(255,255,255,.74)',
              color: isActive ? '#fff' : 'var(--muted)',
              outline: 'none',
              boxShadow: isActive ? '0 6px 16px rgba(59,107,53,.16)' : 'none',
            }}
          >
            <span style={{ fontSize: 15 }}>{c.emoji}</span>
            {c.label}
          </button>
        )
      })}
    </div>
  )
}