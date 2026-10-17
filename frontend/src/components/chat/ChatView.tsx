import * as React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MessageList from "./MessageList";
import Composer from "./Composer";
import type { ChatMessage, SessionSummary } from "./meta";

interface ChatViewProps {
  sessions: SessionSummary[];
  currentId: string | null;
  messages: ChatMessage[];
  loading: boolean;
  backendOk: boolean | null;
  bottomRef: React.RefObject<HTMLDivElement>;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onSend: (q: string) => void;
  onHome: () => void;
}

export default function ChatView(props: ChatViewProps) {
  const { sessions, currentId, messages, loading, backendOk, bottomRef } = props;
  const [menuOpen, setMenuOpen] = React.useState(false);

  // บนมือถือ ปิดลิ้นชักหลังเลือก
  const closeAfter = <A extends unknown[]>(fn: (...a: A) => void) => (...a: A) => {
    fn(...a);
    setMenuOpen(false);
  };

  const title = sessions.find((s) => s._id === currentId)?.title ?? "บทสนทนาใหม่";

  return (
    <div className="flex h-full bg-field-950 text-cream selection:bg-lime/30">
      <Sidebar
        sessions={sessions}
        currentId={currentId}
        onSelect={closeAfter(props.onSelect)}
        onNew={closeAfter(props.onNew)}
        onDelete={props.onDelete}
        onRename={props.onRename}
        onHome={props.onHome}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} backendOk={backendOk} onMenu={() => setMenuOpen(true)} />
        <MessageList messages={messages} loading={loading} bottomRef={bottomRef} onQuick={props.onSend} />
        <Composer onSend={props.onSend} loading={loading} />
      </main>
    </div>
  );
}
