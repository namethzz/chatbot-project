import React, { useState } from "react";
import { useChat } from "./hooks/useChat.js";

import Header from "./components/Header.jsx";
import CropFilterBar from "./components/CropFilterBar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ChatArea from "./components/ChatArea.jsx";
import InputBar from "./components/InputBar.jsx";
import RightPanel from "./components/RightPanel.jsx";
import Toast from "./components/Toast.jsx";
import Landing from "./components/Landing.tsx";

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
  const [view, setView] = useState("landing"); // "landing" | "chat"

  function startChat(question) {
    newSession();
    setView("chat");
    if (question) send(question, { fresh: true });
  }

  if (view === "landing") {
    return (
      <>
        <Landing onStart={startChat} />
        {error && <Toast message={error} onClose={() => setError(null)} />}
      </>
    );
  }

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

      <Header backendOk={backendOk} onHome={() => setView("landing")} />

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
      </div>

      {/* ── Toast / error ── */}
      {error && <Toast message={error} onClose={() => setError(null)} />}
    </div>
  );
}

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
