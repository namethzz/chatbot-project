import React, { useState } from 'react'
import { useChat } from './hooks/useChat.js'

import Header        from './components/Header.jsx'
import CropFilterBar from './components/CropFilterBar.jsx'
import Sidebar       from './components/Sidebar.jsx'
import ChatArea      from './components/ChatArea.jsx'
import InputBar      from './components/InputBar.jsx'
import Toast         from './components/Toast.jsx'

export default function App() {
  const {
    sessions, currentId, messages, loading, stats, backendOk, error,
    bottomRef,
    selectSession, newSession, deleteSession, renameSession, send,
    setError,
  } = useChat()

  const [activeCrop, setActiveCrop] = useState('all')

  function handleCropFilter(key) {
    setActiveCrop(key)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <Background />

      <Header backendOk={backendOk} />

      <CropFilterBar active={activeCrop} onSelect={handleCropFilter} />

      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 5,
      }}>
        <Sidebar
          sessions={sessions}
          currentId={currentId}
          onSelect={selectSession}
          onNew={newSession}
          onDelete={deleteSession}
          onRename={renameSession}
          stats={stats}
        />

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <ChatArea
            messages={messages}
            loading={loading}
            bottomRef={bottomRef}
            onQuick={send}
          />

          <InputBar
            onSend={send}
            loading={loading}
            cropFilter={activeCrop !== 'all' ? activeCrop : null}
          />
        </div>
      </div>

      {error && (
        <Toast message={error} onClose={() => setError(null)} />
      )}
    </div>
  )
}

function Background() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      background: `
        radial-gradient(ellipse 80% 60% at 8% 100%, rgba(59,107,53,.10), transparent 58%),
        radial-gradient(ellipse 55% 40% at 92% 0%, rgba(184,212,232,.16), transparent 50%),
        radial-gradient(ellipse 45% 35% at 50% 50%, rgba(232,213,163,.20), transparent 68%)
      `,
    }} />
  )
}