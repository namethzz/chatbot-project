import React, { useState } from "react";
import { useChat } from "./hooks/useChat.js";

import Header from "./components/Header.jsx";
import CropFilterBar from "./components/CropFilterBar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ChatArea from "./components/ChatArea.jsx";
import InputBar from "./components/InputBar.jsx";
import RightPanel from "./components/RightPanel.jsx";
import Toast from "./components/Toast.jsx";

export default function App() {
  const {
    sessions,
    currentId,
    messages,
    loading,
    stats,
    backendOk,
    error,
    bottomRef,
    selectSession,
    newSession,
    deleteSession,
    renameSession,
    send,
    setError,
  } = useChat();

  const [activeCrop, setActiveCrop] = useState("all");

  function handleCropFilter(key) {
    setActiveCrop(key);
    // InputBar picks up cropFilter prop and pre-fills the textarea
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Background layers ── */}
      <Background />

      {/* ── Header ── */}
      <Header backendOk={backendOk} />

      {/* ── Crop filter bar ── */}
      <CropFilterBar active={activeCrop} onSelect={handleCropFilter} />

      {/* ── Main 3-column layout ── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Left: Session sidebar */}
        <Sidebar
          sessions={sessions}
          currentId={currentId}
          onSelect={selectSession}
          onNew={newSession}
          onDelete={deleteSession}
          onRename={renameSession}
          stats={stats}
        />

        {/* Center: Chat */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
            <ChatArea
              messages={messages}
              loading={loading}
              bottomRef={bottomRef}
              onQuick={send}
            />
          <InputBar
            onSend={send}
            loading={loading}
            cropFilter={activeCrop !== "all" ? activeCrop : null}
          />
        </div>

        {/* Right: Stats panel */}
        <RightPanel stats={stats} />
      </div>

      {/* ── Toast / error ── */}
      {error && <Toast message={error} onClose={() => setError(null)} />}
    </div>
  );
}

/* Radial gradient background — keeps z-index below everything */
function Background() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background: `
        radial-gradient(ellipse 80% 60% at 8% 100%, rgba(59,107,53,.11), transparent 58%),
        radial-gradient(ellipse 55% 40% at 92% 0%,  rgba(184,212,232,.18), transparent 50%),
        radial-gradient(ellipse 45% 35% at 50% 50%, rgba(232,213,163,.25), transparent 68%)
      `,
      }}
    />
  );
}
