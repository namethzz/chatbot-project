import * as React from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CROPS, HINT_TAGS } from "@/utils/constants.js";
import { CropIcons } from "../CropIcons.jsx";
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
        {/* พืช — กดเพื่อใส่ชื่อพืชในคำถาม */}
        <div
          className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_92%,transparent)]"
          role="group"
          aria-label="ใส่ชื่อพืชในคำถาม"
        >
          {CROPS.map((c: { key: string; label: string; icon: string }) => {
            const CropIcon = (CropIcons as Record<string, () => React.ReactNode>)[c.icon];
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => insert(c.key)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-lime/10 bg-field-900 py-1 pl-1.5 pr-3 text-sm text-moss transition-colors hover:border-lime/30 hover:text-cream focus-visible:outline-2 focus-visible:outline-lime"
              >
                <span className="grid size-6 place-items-center rounded-full bg-cream/90">{CropIcon?.()}</span>
                {c.label}
              </button>
            );
          })}
        </div>

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
