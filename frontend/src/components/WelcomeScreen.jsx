import React from 'react'
import { Icon } from './Icons.jsx'
import { QUICK_PROMPTS } from '../utils/constants.js'

export default function WelcomeScreen({ onQuick }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      flex: 1, padding: '40px 24px', textAlign: 'center',
      animation: 'fadeIn .5s ease forwards',
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: 'linear-gradient(135deg, var(--leaf), var(--sprout))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, boxShadow: '0 8px 32px rgba(59,107,53,.25)',
      }}>
        <Icon name="leaf" size={38} color="#fff" />
      </div>

      <h1 style={{
        fontFamily: "'Libre Baskerville', serif",
        fontSize: 26, fontWeight: 700, color: 'var(--soil)',
        marginBottom: 10, lineHeight: 1.3,
      }}>
        สวัสดีครับ เกษตรกร
      </h1>
      <p style={{
        fontSize: 14, color: 'var(--muted)', lineHeight: 1.8,
        maxWidth: 430, marginBottom: 36,
      }}>
        ถามเรื่องพืชเศรษฐกิจไทยได้เลยครับ ทั้งพื้นที่เหมาะสม
        วิธีปลูก และศัตรูพืช ครอบคลุมทั้ง 14 ชนิด
      </p>

      {/* Quick start grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10, width: '100%', maxWidth: 520,
      }}>
        {QUICK_PROMPTS.map(qp => (
          <QuickCard key={qp.title} {...qp} onClick={() => onQuick(qp.q)} />
        ))}
      </div>
    </div>
  )
}

function QuickCard({ icon, title, sub, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(59,107,53,.06)' : 'rgba(255,255,255,.85)',
        border: `1.5px solid ${hovered ? 'var(--sprout)' : 'rgba(74,44,26,.13)'}`,
        borderRadius: 14, padding: '15px 16px', textAlign: 'left',
        cursor: 'pointer', transition: 'all .2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 6px 20px rgba(59,107,53,.12)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--soil)', lineHeight: 1.3 }}>{title}</span>
      <span style={{ fontSize: 11.5, color: 'var(--hint)', lineHeight: 1.55 }}>{sub}</span>
    </button>
  )
}
