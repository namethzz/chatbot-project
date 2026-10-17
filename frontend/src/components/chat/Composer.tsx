import * as React from "react";
import { ArrowUp, ChevronDown, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CROPS, HINT_TAGS } from "@/utils/constants.js";
import { FallbackIcon, KIND_ICON } from "./meta";

interface ComposerProps {
  onSend: (q: string) => void;
  loading: boolean;
}

const MAX_HEIGHT = 180;

export default function Composer({ onSend, loading }: ComposerProps) {
  const [value, setValue] = React.useState("");
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px";
  }, [value]);

  const canSend = value.trim().length > 0 && !loading;

  function submit() {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  }

  // แทรกคำ (ชื่อพืช / หัวข้อ) ต่อท้ายข้อความที่พิมพ์อยู่
  function insert(text: string) {
    setValue((v) => (v.trimEnd() ? `${v.trimEnd()} ${text} ` : `${text} `));
    ref.current?.focus();
  }

  return (
    <div className="shrink-0 border-t border-lime/10 bg-field-950/90 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-3 sm:px-6">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="flex items-end gap-2 rounded-2xl border border-lime/15 bg-field-800 p-2 pl-4 transition-colors focus-within:border-lime/50"
        >
          <label htmlFor="composer" className="sr-only">พิมพ์คำถาม</label>
          <textarea
            id="composer"
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="ถามเรื่องพืชเศรษฐกิจไทย เช่น ทุเรียนปลูกที่ระยองได้ไหม"
            className="max-h-[180px] min-w-0 flex-1 resize-none bg-transparent py-2 leading-relaxed text-cream caret-lime outline-none placeholder:text-moss/70 [scrollbar-width:none]"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label={loading ? "กำลังหาคำตอบ" : "ส่งคำถาม"}
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-lime text-field-950 transition-[background-color,opacity] hover:bg-straw focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-lime"
          >
            {loading ? (
              <LoaderCircle className="size-5 motion-safe:animate-spin" aria-hidden />
            ) : (
              <ArrowUp className="size-5" strokeWidth={2.4} aria-hidden />
            )}
          </button>
        </form>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <CropPicker onPick={insert} />
          <span className="mx-1 h-4 w-px bg-lime/15" aria-hidden />
          {HINT_TAGS.map((h: { kind: string; label: string; insert: string }) => {
            const Icon = KIND_ICON[h.kind] ?? FallbackIcon;
            return (
              <button
                key={h.label}
                type="button"
                onClick={() => insert(h.insert)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-moss/80 transition-colors",
                  "hover:bg-field-800 hover:text-cream focus-visible:outline-2 focus-visible:outline-lime",
                )}
              >
                <Icon className="size-3.5 text-lime/80" aria-hidden />
                {h.label}
              </button>
            );
          })}
          <span className="ml-auto hidden text-xs text-moss/60 sm:inline">
            <kbd className="font-sans">Enter</kbd> ส่ง · <kbd className="font-sans">Shift+Enter</kbd> ขึ้นบรรทัดใหม่
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── เลือกพืช: ปุ่มเดียว เปิดรายชื่อพืชขึ้นมาเหนือช่องพิมพ์ ─────────────
function CropPicker({ onPick }: { onPick: (crop: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    rootRef.current?.querySelector<HTMLButtonElement>("[data-crop]")?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-lime",
          open ? "bg-field-800 text-cream" : "text-lime hover:bg-field-800",
        )}
      >
        เลือกพืช
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div
          id={listId}
          role="group"
          aria-label="ใส่ชื่อพืชในคำถาม"
          className="absolute bottom-full left-0 z-20 mb-2 grid w-[min(88vw,22rem)] grid-cols-2 gap-0.5 rounded-xl border border-lime/15 bg-field-900 p-1.5 shadow-[0_18px_40px_-8px_rgba(0,0,0,.6)] animate-[fadeUp_.18s_ease-out] sm:grid-cols-3"
        >
          {CROPS.map((c: { key: string; label: string }) => (
            <button
              key={c.key}
              type="button"
              data-crop
              onClick={() => { onPick(c.key); setOpen(false); }}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm text-moss transition-colors hover:bg-field-800 hover:text-cream focus-visible:bg-field-800 focus-visible:text-cream focus-visible:outline-none"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
