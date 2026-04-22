import React from 'react'
import { Icon } from './Icons.jsx'
import { INTENT, SOURCE } from '../utils/constants.js'

export function TypingBubble() {
  return (
    <div style={{ alignSelf: 'flex-start', animation: 'fadeUp .3s ease forwards' }}>
      <BotMeta intent={null} latencyMs={0} />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '16px 18px',
        background: 'rgba(255,255,255,.96)',
        border: '1px solid rgba(74,44,26,.08)',
        borderRadius: '10px 22px 22px 22px',
        boxShadow: 'var(--sh-sm)',
        width: 'fit-content',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--sprout)',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

export default function MessageBubble({ msg, isLatest }) {
  if (msg.role === 'user') return <UserBubble msg={msg} isLatest={isLatest} />
  return <BotBubble msg={msg} isLatest={isLatest} />
}

function UserBubble({ msg, isLatest }) {
  return (
    <div style={{
      alignSelf: 'flex-end',
      maxWidth: '72%',
      animation: isLatest ? 'fadeUp .28s ease forwards' : 'none',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--soil), var(--earth))',
        color: '#F5EFE0',
        padding: '16px 20px',
        borderRadius: '22px 22px 8px 22px',
        fontSize: 17,
        lineHeight: 1.75,
        boxShadow: '0 8px 20px rgba(44,26,14,.12)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function BotMeta({ intent, latencyMs }) {
  const cfg = intent ? INTENT[intent] : null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    }}>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 12,
        background: 'linear-gradient(135deg, var(--leaf), var(--sprout))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 6px 18px rgba(59,107,53,.20)',
      }}>
        <Icon name="sprout" size={18} color="#fff" />
      </div>

      <span style={{
        fontSize: 13.5,
        fontWeight: 700,
        color: 'var(--leaf)',
        letterSpacing: '.02em',
      }}>
        ผู้ช่วยเกษตร AI
      </span>

      {cfg && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11.5,
          fontWeight: 700,
          background: cfg.bg,
          color: cfg.color,
        }}>
          {cfg.label}
        </span>
      )}

      {latencyMs > 0 && (
        <span style={{
          fontSize: 11.5,
          color: 'var(--hint)',
          marginLeft: 'auto',
        }}>
          {(latencyMs / 1000).toFixed(1)}s
        </span>
      )}
    </div>
  )
}

function BotBubble({ msg, isLatest }) {
  const lines = (msg.content || '').split('\n')

  return (
    <div style={{
      alignSelf: 'flex-start',
      maxWidth: '82%',
      animation: isLatest ? 'fadeUp .32s ease forwards' : 'none',
    }}>
      <BotMeta intent={msg.intent} latencyMs={msg.latencyMs} />

      <div style={{
        background: 'rgba(255,255,255,.96)',
        border: '1px solid rgba(74,44,26,.08)',
        borderRadius: '10px 22px 22px 22px',
        padding: '20px 22px',
        fontSize: 17,
        lineHeight: 1.95,
        color: 'var(--text)',
        boxShadow: '0 10px 26px rgba(44,26,14,.08)',
      }}>
        {msg.highlight && (
          <div style={{
            background: 'rgba(59,107,53,.08)',
            borderLeft: '4px solid var(--sprout)',
            borderRadius: '0 10px 10px 0',
            padding: '12px 14px',
            marginBottom: 16,
            fontSize: 15.5,
            color: 'var(--soil)',
            fontWeight: 600,
          }}>
            {msg.highlight}
          </div>
        )}

        <div>
          {lines.map((line, i) => {
            const isBullet = /^[•\-\*]/.test(line)

            if (isBullet) {
              return (
                <div key={i} style={{
                  display: 'flex',
                  gap: 10,
                  marginBottom: 8,
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    color: 'var(--sprout)',
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: 1.7,
                  }}>
                    •
                  </span>
                  <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                </div>
              )
            }

            return (
              <p key={i} style={{ marginBottom: i < lines.length - 1 ? 10 : 0 }}>
                {line}
              </p>
            )
          })}
        </div>

        {msg.sources?.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid rgba(74,44,26,.08)',
          }}>
            {msg.sources.map(s => {
              const c = SOURCE[s]
              if (!c) return null

              return (
                <span key={s} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  color: c.color,
                }}>
                  {c.label}
                </span>
              )
            })}

            {msg.docsUsed > 0 && (
              <span style={{
                fontSize: 12,
                color: 'var(--hint)',
                marginLeft: 'auto',
                alignSelf: 'center',
                fontWeight: 600,
              }}>
                ใช้ข้อมูล {msg.docsUsed} เอกสาร
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}