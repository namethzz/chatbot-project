import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Icon } from './Icons.jsx'
import { INTENT, SOURCE } from '../utils/constants.js'

export function TypingBubble() {
  return (
    <div style={{
      alignSelf: 'flex-start',
      width: '100%',
      maxWidth: 760,
      animation: 'fadeUp .3s ease forwards',
    }}>
      <BotMeta intent={null} latencyMs={0} />
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '16px 18px',
        background: 'rgba(255,255,255,.95)',
        border: '1px solid rgba(74,44,26,.08)',
        borderRadius: '16px 24px 24px 24px',
        boxShadow: '0 8px 24px rgba(44,26,14,.06)',
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--sprout)',
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function MessageBubble({ msg, isLatest }) {
  if (msg.role === 'user') return <UserBubble msg={msg} isLatest={isLatest} />
  return <BotBubble msg={msg} isLatest={isLatest} />
}

function cleanMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^\s*[\*\-]\s+/gm, '')
    .replace(/\*/g, '')
}

function UserBubble({ msg, isLatest }) {
  return (
    <div style={{
      alignSelf: 'flex-end',
      width: '100%',
      maxWidth: 760,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: isLatest ? 'fadeUp .28s ease forwards' : 'none',
    }}>
      <div style={{
        maxWidth: '78%',
        background: '#111',
        color: '#ffffff',
        padding: '16px 20px',
        borderRadius: '22px 22px 10px 22px',
        fontSize: 16.5,
        lineHeight: 1.8,
        boxShadow: '0 12px 26px rgba(44,26,14,.12)',
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
        width: 38,
        height: 38,
        borderRadius: 14,
        background: 'linear-gradient(135deg, var(--leaf), var(--sprout))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 8px 20px rgba(59,107,53,.20)',
      }}>
        <Icon name="sprout" size={18} color="#fff" />
      </div>

      <span style={{
        fontSize: 13.5,
        fontWeight: 800,
        color: 'var(--leaf)',
        letterSpacing: '.01em',
      }}>
        ผู้ช่วยเกษตร AI
      </span>

      {cfg && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 10px',
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
          fontWeight: 600,
        }}>
          {(latencyMs / 1000).toFixed(1)}s
        </span>
      )}
    </div>
  )
}

function BotBubble({ msg, isLatest }) {
  return (
    <div style={{
      alignSelf: 'flex-start',
      width: '100%',
      maxWidth: 760,
      animation: isLatest ? 'fadeUp .32s ease forwards' : 'none',
    }}>
      <BotMeta intent={msg.intent} latencyMs={msg.latencyMs} />

      <div style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.92))',
        border: '1px solid rgba(74,44,26,.08)',
        borderRadius: '16px 24px 24px 24px',
        padding: '22px 24px',
        fontSize: 16.5,
        lineHeight: 1.9,
        color: 'var(--text)',
        boxShadow: '0 14px 30px rgba(44,26,14,.06)',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
      }}>
        {msg.highlight && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,107,53,.08), rgba(109,191,91,.06))',
            border: '1px solid rgba(59,107,53,.12)',
            borderLeft: '4px solid var(--sprout)',
            borderRadius: 14,
            padding: '13px 15px',
            marginBottom: 18,
            fontSize: 15.5,
            color: 'var(--soil)',
            fontWeight: 700,
          }}>
            {cleanMarkdown(msg.highlight)}
          </div>
        )}

        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p({ children }) {
                return (
                  <p style={{
                    margin: '0 0 13px 0',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {children}
                  </p>
                )
              },
              h1({ children }) {
                return (
                  <h1 style={{
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: 1.25,
                    margin: '0 0 16px 0',
                    color: 'var(--soil)',
                    letterSpacing: '-0.02em',
                  }}>
                    {children}
                  </h1>
                )
              },
              h2({ children }) {
                return (
                  <h2 style={{
                    fontSize: 23,
                    fontWeight: 800,
                    lineHeight: 1.3,
                    margin: '4px 0 14px 0',
                    color: 'var(--soil)',
                    letterSpacing: '-0.01em',
                  }}>
                    {children}
                  </h2>
                )
              },
              h3({ children }) {
                return (
                  <h3 style={{
                    fontSize: 19,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    margin: '4px 0 12px 0',
                    color: 'var(--soil)',
                  }}>
                    {children}
                  </h3>
                )
              },
              ul({ children }) {
                return (
                  <ul style={{
                    margin: '0 0 14px 0',
                    paddingLeft: 24,
                  }}>
                    {children}
                  </ul>
                )
              },
              ol({ children }) {
                return (
                  <ol style={{
                    margin: '0 0 14px 0',
                    paddingLeft: 24,
                  }}>
                    {children}
                  </ol>
                )
              },
              li({ children }) {
                return <li style={{ marginBottom: 8 }}>{children}</li>
              },
              strong({ children }) {
                return (
                  <strong style={{
                    fontWeight: 800,
                    color: 'var(--soil)',
                  }}>
                    {children}
                  </strong>
                )
              },
              blockquote({ children }) {
                return (
                  <blockquote style={{
                    margin: '14px 0',
                    padding: '12px 15px',
                    borderLeft: '4px solid var(--sprout)',
                    background: 'rgba(59,107,53,.06)',
                    borderRadius: '0 12px 12px 0',
                    color: 'var(--soil)',
                  }}>
                    {children}
                  </blockquote>
                )
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: 'var(--leaf)',
                      fontWeight: 700,
                      textDecoration: 'underline',
                    }}
                  >
                    {children}
                  </a>
                )
              },
              code({ inline, children }) {
                if (inline) {
                  return (
                    <code style={{
                      background: 'rgba(74,44,26,.08)',
                      padding: '3px 8px',
                      borderRadius: 8,
                      fontSize: '0.92em',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      color: 'var(--soil)',
                    }}>
                      {children}
                    </code>
                  )
                }

                return (
                  <pre style={{
                    background: '#0d1117',
                    color: '#f3f4f6',
                    padding: '16px 18px',
                    borderRadius: 16,
                    overflowX: 'auto',
                    margin: '15px 0',
                    fontSize: 14.5,
                    lineHeight: 1.7,
                    border: '1px solid rgba(255,255,255,.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.03)',
                  }}>
                    <code style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}>
                      {children}
                    </code>
                  </pre>
                )
              },
              table({ children }) {
                return (
                  <div style={{
                    overflowX: 'auto',
                    margin: '15px 0',
                    borderRadius: 14,
                    border: '1px solid rgba(74,44,26,.10)',
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 15,
                      background: '#fff',
                    }}>
                      {children}
                    </table>
                  </div>
                )
              },
              th({ children }) {
                return (
                  <th style={{
                    borderBottom: '1px solid rgba(74,44,26,.10)',
                    padding: '11px 12px',
                    background: 'rgba(59,107,53,.08)',
                    textAlign: 'left',
                    fontWeight: 700,
                    color: 'var(--soil)',
                  }}>
                    {children}
                  </th>
                )
              },
              td({ children }) {
                return (
                  <td style={{
                    borderTop: '1px solid rgba(74,44,26,.08)',
                    padding: '10px 12px',
                    verticalAlign: 'top',
                  }}>
                    {children}
                  </td>
                )
              },
              hr() {
                return (
                  <hr style={{
                    border: 'none',
                    borderTop: '1px solid rgba(74,44,26,.12)',
                    margin: '18px 0',
                  }} />
                )
              },
            }}
          >
            {cleanMarkdown(msg.content || '')}
          </ReactMarkdown>
        </div>

        {msg.sources?.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginTop: 18,
            paddingTop: 14,
            borderTop: '1px solid rgba(74,44,26,.08)',
          }}>
            {msg.sources.map(s => {
              const c = SOURCE[s]
              if (!c) return null

              return (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    color: c.color,
                  }}
                >
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
                fontWeight: 700,
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