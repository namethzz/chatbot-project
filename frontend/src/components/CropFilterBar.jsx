import React from 'react'
import { CROPS } from '../utils/constants.js'

export default function CropFilterBar({ active, onSelect }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '9px 28px', overflowX: 'auto', flexShrink: 0,
      borderBottom: '1px solid rgba(74,44,26,.08)',
      background: 'rgba(245,239,224,.6)',
      scrollbarWidth: 'none',
      position: 'relative', zIndex: 10,
    }}>
      <span style={{
        fontSize: 10.5, color: 'var(--hint)', whiteSpace: 'nowrap',
        fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase',
        flexShrink: 0, marginRight: 4,
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
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 20,
              fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
              flexShrink: 0, cursor: 'pointer',
              transition: 'all .18s ease',
              border: isActive
                ? '1.5px solid var(--leaf)'
                : '1.5px solid rgba(74,44,26,.15)',
              background: isActive ? 'var(--leaf)' : 'rgba(255,255,255,.72)',
              color: isActive ? '#fff' : 'var(--muted)',
              outline: 'none',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--sprout)'
                e.currentTarget.style.color = 'var(--leaf)'
                e.currentTarget.style.background = 'rgba(59,107,53,.07)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'rgba(74,44,26,.15)'
                e.currentTarget.style.color = 'var(--muted)'
                e.currentTarget.style.background = 'rgba(255,255,255,.72)'
              }
            }}
          >
            <span style={{ fontSize: 13 }}>{c.emoji}</span>
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
