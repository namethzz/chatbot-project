import * as React from "react";
import { Check, MessageSquare, Pencil, Plus, Sprout, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionSummary } from "./meta";

interface SidebarProps {
  sessions: SessionSummary[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onHome: () => void;
  /** บนมือถือ sidebar เป็นลิ้นชัก — ปิดหลังเลือกรายการ */
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  sessions, currentId, onSelect, onNew, onDelete, onRename, onHome, open, onClose,
}: SidebarProps) {
  return (
    <>
      {/* ฉากหลังตอนเปิดลิ้นชักบนมือถือ */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-lime/10 bg-field-900 transition-transform duration-300 ease-out",
          "md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={onHome}
            title="กลับหน้าแรก"
            className="flex cursor-pointer items-center gap-2.5 rounded-lg p-1 -m-1 focus-visible:outline-2 focus-visible:outline-lime"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-leaf">
              <Sprout className="size-[18px] text-cream" strokeWidth={2.2} aria-hidden />
            </span>
            <span className="font-display text-base font-semibold">ที่ปรึกษาเกษตรกร</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-moss hover:bg-field-800 md:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={onNew}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-lime py-2.5 text-sm font-semibold text-field-950 transition-colors hover:bg-straw focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
            แชทใหม่
          </button>
        </div>

        <h2 className="px-5 pb-2 text-xs font-semibold text-moss/70">ประวัติการสนทนา</h2>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-4" aria-label="ประวัติการสนทนา">
          {sessions.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm leading-relaxed text-moss/70">
              ยังไม่มีบทสนทนา
              <br />
              คำถามที่ถามจะเก็บไว้ที่นี่
            </p>
          ) : (
            <ul className="space-y-0.5">
              {sessions.map((s) => (
                <SessionItem
                  key={s._id}
                  session={s}
                  active={s._id === currentId}
                  onSelect={() => onSelect(s._id)}
                  onDelete={() => onDelete(s._id)}
                  onRename={(t) => onRename(s._id, t)}
                />
              ))}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
}

function SessionItem({
  session, active, onSelect, onDelete, onRename,
}: {
  session: SessionSummary;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(session.title);

  function commit() {
    const t = draft.trim();
    if (t && t !== session.title) onRename(t);
    setEditing(false);
  }

  const date = new Date(session.updatedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" });

  if (editing) {
    return (
      <li className="flex items-center gap-1 rounded-lg bg-field-800 p-1.5">
        <input
          autoFocus
          value={draft}
          aria-label="ชื่อบทสนทนา"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="min-w-0 flex-1 rounded-md border border-lime/40 bg-field-950 px-2 py-1.5 text-sm text-cream caret-lime outline-none"
        />
        <IconButton label="บันทึกชื่อ" onClick={commit}><Check className="size-4" /></IconButton>
        <IconButton label="ยกเลิก" onClick={() => setEditing(false)}><X className="size-4" /></IconButton>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "group relative flex items-start rounded-lg transition-colors",
        active ? "bg-field-700" : "hover:bg-field-800",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lime rounded-lg"
      >
        <MessageSquare className={cn("mt-0.5 size-4 shrink-0", active ? "text-lime" : "text-moss/60")} aria-hidden />
        <span className="min-w-0">
          <span className="line-clamp-2 text-sm leading-snug text-cream">{session.title}</span>
          <span className="mt-1 block text-xs text-moss/70 tabular-nums">
            {session.msgCount} ข้อความ · {date}
          </span>
        </span>
      </button>
      <span className="flex shrink-0 gap-0.5 pr-1.5 pt-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <IconButton label="เปลี่ยนชื่อ" onClick={() => { setDraft(session.title); setEditing(true); }}>
          <Pencil className="size-3.5" />
        </IconButton>
        <IconButton label="ลบบทสนทนา" onClick={onDelete} danger>
          <Trash2 className="size-3.5" />
        </IconButton>
      </span>
    </li>
  );
}

function IconButton({
  label, onClick, danger, children,
}: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-7 cursor-pointer place-items-center rounded-md text-moss/70 transition-colors focus-visible:outline-2 focus-visible:outline-lime",
        danger ? "hover:bg-red-500/15 hover:text-red-300" : "hover:bg-field-700 hover:text-cream",
      )}
    >
      {children}
    </button>
  );
}
