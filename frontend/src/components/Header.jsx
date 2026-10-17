import React from 'react'
import { Icon } from './Icons.jsx'
import { isDemo } from '../utils/api.js'

export default function Header({ backendOk, docsCount = 46340 }) {
  return (
    <header style={{
      position: 'relative',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      borderBottom: '1px solid rgba(74,44,26,.10)',
      background: 'rgba(245,239,224,.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: 'linear-gradient(135deg, var(--leaf), var(--sprout))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 28px rgba(59,107,53,.24)',
        }}>
          <Icon name="sprout" size={24} color="#fff" />
        </div>

        <div>
          <div style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--soil)',
            lineHeight: 1.15,
          }}>
            ที่ปรึกษาเกษตรกร
          </div>
          <div style={{
            fontSize: 12.5,
            color: 'var(--muted)',
            marginTop: 3,
            letterSpacing: '.04em',
          }}>
            พืชเศรษฐกิจไทย · ระบบผู้ช่วยตอบคำถามเกษตร
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Chip
          leftNode={
            backendOk === null
              ? <Icon name="sparkles" size={14} color="var(--gold)" />
              : backendOk
              ? <StatusDot active />
              : <Icon name="wifiOff" size={14} color="var(--red)" />
          }
          label={
            backendOk === null
              ? 'กำลังตรวจสอบระบบ'
              : isDemo
              ? 'โหมดเดโม'
              : backendOk
              ? 'เชื่อมต่อแล้ว'
              : 'Backend ออฟไลน์'
          }
          accent={backendOk === false ? 'rgba(155,43,26,.10)' : 'rgba(59,107,53,.08)'}
          border={backendOk === false ? 'rgba(155,43,26,.24)' : 'rgba(59,107,53,.22)'}
          color={backendOk === false ? 'var(--red)' : 'var(--leaf)'}
        />

        <Chip
          leftNode={<Icon name="chart" size={14} color="var(--gold)" />}
          label={`14 พืช · ${docsCount.toLocaleString()} เอกสาร`}
          accent="rgba(201,132,30,.08)"
          border="rgba(201,132,30,.22)"
          color="var(--gold)"
        />
      </div>
    </header>
  )
}

function StatusDot({ active }) {
  return (
    <div style={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: active ? 'var(--sprout)' : 'var(--red)',
      animation: active ? 'pulse 2s ease-in-out infinite' : 'none',
      flexShrink: 0,
    }} />
  )
}

function Chip({ label, leftNode, accent, border, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '8px 13px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      background: accent,
      border: `1px solid ${border}`,
      color,
    }}>
      {leftNode}
      {label}
    </div>
  )
}