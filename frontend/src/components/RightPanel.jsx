import React from 'react'

export default function RightPanel({ stats }) {
  const byCrop = stats?.byCrop ? Object.entries(stats.byCrop) : []
  const topCrops = byCrop.sort((a, b) => b[1] - a[1]).slice(0, 5)
  const total = topCrops.reduce((s, [, n]) => s + n, 0) || 1

  const dotColors = [
    'var(--leaf)', 'var(--amber)', 'var(--sand)', 'var(--sky)', 'var(--red)',
  ]

  return (
    <aside style={{
      width: 216, flexShrink: 0,
      borderLeft: '1px solid rgba(74,44,26,.1)',
      background: 'rgba(245,239,224,.42)',
      overflowY: 'auto', padding: '16px 14px',
      display: 'flex', flexDirection: 'column', gap: 14,
      scrollbarWidth: 'none',
    }}>

      {/* System stats */}
      <Section title="สถานะระบบ">
        <Card>
          {[
            { label: 'Documents',  val: '736', pct: 100, color: 'var(--sprout)' },
            { label: 'พืช',        val: '14',  pct: 100, color: 'var(--amber)'  },
            { label: 'จังหวัด',   val: '57',  pct: 74,  color: 'var(--sky)'    },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{row.label}</span>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: 'var(--soil)',
                  fontFamily: "'Libre Baskerville', serif",
                }}>
                  {row.val}
                </span>
              </div>
              <BarTrack>
                <div style={{
                  height: '100%', borderRadius: 2,
                  background: row.color, width: `${row.pct}%`,
                }} />
              </BarTrack>
            </div>
          ))}
        </Card>
      </Section>

      {/* Data sources */}
      <Section title="แหล่งข้อมูล">
        <Card>
          {[
            { dot: 'var(--gold)',   label: 'Agri-Map (ที่ดิน)',  cnt: 625 },
            { dot: 'var(--sprout)', label: 'คู่มือปลูก',          cnt: 14  },
            { dot: 'var(--red)',    label: 'ศัตรูพืช (PDF)',       cnt: 97  },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: 2,
                background: s.dot, flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, color: 'var(--muted)', flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--soil)' }}>{s.cnt}</span>
            </div>
          ))}
        </Card>
      </Section>

      {/* Today stats */}
      <Section title="วันนี้">
        <div style={{ display: 'flex', gap: 8 }}>
          <StatMini label="ถาม" val={stats?.todayAsked ?? '—'} color="var(--leaf)" />
          <StatMini label="session" val={stats?.totalSessions ?? '—'} color="var(--gold)" />
        </div>
      </Section>

      {/* Top crops */}
      {topCrops.length > 0 && (
        <Section title="พืชที่ถามมาก">
          <Card>
            {topCrops.map(([crop, n], i) => (
              <div key={crop} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 0', fontSize: 11.5, color: 'var(--muted)',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: dotColors[i], flexShrink: 0,
                }} />
                <span style={{ flex: 1 }}>{crop}</span>
                <span style={{ fontSize: 10, color: 'var(--hint)' }}>
                  {Math.round(n / total * 100)}%
                </span>
              </div>
            ))}
          </Card>
        </Section>
      )}

      {/* RAG status note */}
      <Section title="สถานะ RAG">
        <Card>
          <div style={{
            fontSize: 11, color: 'var(--muted)', lineHeight: 1.7,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(201,132,30,.1)', color: 'var(--gold)',
              borderRadius: 6, padding: '3px 8px', fontSize: 10.5,
              fontWeight: 600, marginBottom: 7,
            }}>
              ⏳ กำลังพัฒนา
            </div>
            <div>Qwen2-1.5B + ChromaDB<br />
              เชื่อมต่อ RAG backend<br />
              ใน .env → RAG_API_URL
            </div>
          </div>
        </Card>
      </Section>
    </aside>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{
        fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.09em',
        color: 'var(--hint)', fontWeight: 600, marginBottom: 7,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Card({ children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.76)',
      border: '1px solid rgba(74,44,26,.1)',
      borderRadius: 11, padding: '11px 12px',
    }}>
      {children}
    </div>
  )
}

function BarTrack({ children }) {
  return (
    <div style={{
      height: 4, background: 'rgba(74,44,26,.1)',
      borderRadius: 2, overflow: 'hidden',
    }}>
      {children}
    </div>
  )
}

function StatMini({ label, val, color }) {
  return (
    <div style={{
      flex: 1, background: 'rgba(255,255,255,.76)',
      border: '1px solid rgba(74,44,26,.1)',
      borderRadius: 11, padding: '10px 12px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 20, fontWeight: 700, color,
        fontFamily: "'Libre Baskerville', serif",
        lineHeight: 1.1,
      }}>
        {val}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--hint)', marginTop: 3 }}>
        {label}
      </div>
    </div>
  )
}
