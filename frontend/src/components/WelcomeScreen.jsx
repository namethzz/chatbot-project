import React from 'react'
import { Icon } from './Icons.jsx'
import { QUICK_PROMPTS } from '../utils/constants.js'

export default function WelcomeScreen({ onQuick }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: '56px 24px',
      textAlign: 'center',
      animation: 'fadeIn .5s ease forwards',
    }}>
      <div style={{
        width: 88,
        height: 88,
        borderRadius: 26,
        background: 'linear-gradient(135deg, var(--leaf), var(--sprout))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        boxShadow: '0 12px 34px rgba(59,107,53,.24)',
      }}>
        <Icon name="sprout" size={42} color="#fff" />
      </div>

      <h1 style={{
        fontFamily: "'Libre Baskerville', 'Noto Serif Thai', serif",
        fontSize: 34,
        fontWeight: 700,
        color: 'var(--soil)',
        marginBottom: 12,
        lineHeight: 1.25,
      }}>
        สวัสดีครับ เกษตรกร
      </h1>

      <p style={{
        fontSize: 18,
        color: 'var(--muted)',
        lineHeight: 1.9,
        maxWidth: 620,
        marginBottom: 42,
      }}>
        ถามเรื่องพืชเศรษฐกิจไทยได้เลยครับ ทั้งพื้นที่เหมาะสม
        วิธีปลูก และศัตรูพืช ครอบคลุมทั้ง 14 ชนิด
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(250px, 1fr))',
        gap: 14,
        width: '100%',
        maxWidth: 760,
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
        background: hovered ? 'rgba(59,107,53,.06)' : 'rgba(255,255,255,.88)',
        border: `1.5px solid ${hovered ? 'var(--sprout)' : 'rgba(74,44,26,.12)'}`,
        borderRadius: 18,
        padding: '20px 20px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all .2s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 10px 24px rgba(59,107,53,.12)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize: 17,
        fontWeight: 700,
        color: 'var(--soil)',
        lineHeight: 1.35,
      }}>
        {title}
      </span>
      <span style={{
        fontSize: 14,
        color: 'var(--hint)',
        lineHeight: 1.7,
      }}>
        {sub}
      </span>
    </button>
  )
}