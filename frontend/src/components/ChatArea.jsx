import React from 'react'
import MessageBubble, { TypingBubble } from './MessageBubble.jsx'
import WelcomeScreen from './WelcomeScreen.jsx'

export default function ChatArea({ messages, loading, bottomRef, onQuick }) {
  const hasMessages = messages.length > 0

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      padding: hasMessages ? '28px 40px' : '0',
      display: 'flex', flexDirection: 'column',
      gap: 20,
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(74,44,26,.15) transparent',
    }}>
      {!hasMessages && (
        <WelcomeScreen onQuick={onQuick} />
      )}

      {messages.map((msg, i) => (
        <MessageBubble
          key={msg._id || i}
          msg={msg}
          isLatest={i === messages.length - 1}
        />
      ))}

      {loading && <TypingBubble />}

      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  )
}
