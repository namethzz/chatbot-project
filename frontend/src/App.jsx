import React, { useState } from "react";
import { useChat } from "./hooks/useChat.js";
import Landing from "./components/Landing.tsx";
import ChatView from "./components/chat/ChatView.tsx";
import Toast from "./components/chat/Toast.tsx";

export default function App() {
  const chat = useChat();
  const [view, setView] = useState("landing"); // "landing" | "chat"

  function startChat(question) {
    chat.newSession();
    setView("chat");
    if (question) chat.send(question, { fresh: true });
  }

  return (
    <>
      {view === "landing" ? (
        <Landing onStart={startChat} />
      ) : (
        <ChatView
          sessions={chat.sessions}
          currentId={chat.currentId}
          messages={chat.messages}
          loading={chat.loading}
          backendOk={chat.backendOk}
          bottomRef={chat.bottomRef}
          onSelect={chat.selectSession}
          onNew={chat.newSession}
          onDelete={chat.deleteSession}
          onRename={chat.renameSession}
          onSend={chat.send}
          onHome={() => setView("landing")}
        />
      )}
      {chat.error && <Toast message={chat.error} onClose={() => chat.setError(null)} />}
    </>
  );
}
