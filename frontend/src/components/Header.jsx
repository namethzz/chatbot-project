import React from 'react'
import { Icon } from './Icons.jsx'

export default function Header({ backendOk, docsCount = 736 }) {
  return (
    <header style={{
      position: 'relative', zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 28px',
      borderBottom: '1px solid rgba(74,44,26,.12)',
      background: 'rgba(245,239,224,.9)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'var(--leaf)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59,107,53,.3)',
        }}>
          <Icon name="leaf" size={22} color="#fff" />
        </div>
        <div>
          <div style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 15, fontWeight: 700, color: 'var(--soil)', lineHeight: 1.1,
          }}>
            ที่ปรึกษาเกษตรกร
          </div>
          <div style={{
            fontSize: 10.5, color: 'var(--muted)',
            letterSpacing: '.07em', textTransform: 'uppercase', marginTop: 2,
          }}>
            พืชเศรษฐกิจไทย · RAG AI
          </div>
        </div>
      </div>

      {/* Status chips */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Backend status */}
        <Chip
          icon={
            backendOk === null ? '⏳' :
            backendOk ? <StatusDot active /> : null
          }
          label={
            backendOk === null ? 'กำลังตรวจสอบ' :
            backendOk ? 'เชื่อมต่อแล้ว' : 'Backend ออฟไลน์'
          }
          accent={backendOk === false ? 'rgba(155,43,26,.15)' : 'rgba(59,107,53,.1)'}
          border={backendOk === false ? 'rgba(155,43,26,.3)' : 'rgba(59,107,53,.28)'}
          color={backendOk === false ? 'var(--red)' : 'var(--leaf)'}
          leftNode={backendOk === false ? <Icon name="wifiOff" size={12} color="var(--red)" /> : undefined}
        />
        {/* Docs chip */}
        <Chip
          label={`📊 14 พืช · ${docsCount} docs`}
          accent="rgba(201,132,30,.09)"
          border="rgba(201,132,30,.28)"
          color="var(--gold)"
        />
      </div>
    </header>
  )
}

function StatusDot({ active }) {
  return (
    <div style={{
      width: 7, height: 7, borderRadius: '50%',
      background: active ? 'var(--sprout)' : 'var(--red)',
      animation: active ? 'pulse 2s ease-in-out infinite' : 'none',
      flexShrink: 0,
    }} />
  )
}

function Chip({ label, icon, leftNode, accent, border, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 11px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
      background: accent, border: `1px solid ${border}`, color,
    }}>
      {leftNode}
      {icon && typeof icon !== 'string' ? icon : null}
      {typeof icon === 'string' ? <span>{icon}</span> : null}
      {label}
    </div>
  )
}
