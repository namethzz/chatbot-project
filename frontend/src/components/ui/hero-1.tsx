import * as React from "react";
import { ArrowUp, Search, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

// Hero1 จาก 21st.dev ปรับให้รับข้อมูลผ่าน props และใช้โทนสีของโปรเจกต์
// (ลำแสงยามเช้าสีฟาง → เขียวอ่อน บนพื้นทุ่งยามรุ่งสาง)
// ตัดบรรทัด "use client" ออก — เป็นคำสั่งของ Next.js ส่วนโปรเจกต์นี้ใช้ Vite

export interface Hero1Props {
  brand: string;
  /** โลโก้หน้าชื่อแบรนด์ (ถ้าไม่ใส่ใช้ไอคอน Sprout) */
  logo?: React.ReactNode;
  ctaLabel: string;
  onCtaClick?: () => void;
  headline: React.ReactNode;
  subtitle: React.ReactNode;
  placeholder: string;
  inputLabel: string;
  submitLabel: string;
  suggestions: string[];
  onSubmit: (text: string) => void;
  /** ข้อความเล็กใต้ตัวเลือก เช่น แหล่งข้อมูล หรือแจ้งว่าเป็นโหมดเดโม */
  footnote?: React.ReactNode;
  /** ชั้นพื้นหลังเพิ่มเติม (วางใต้ลำแสง) */
  background?: React.ReactNode;
  className?: string;
}

const BEAM_GROUPS = [
  { position: "top-[-40rem] right-[-30rem]", height: "h-[20rem]" },
  { position: "top-[-50rem] right-[-50rem]", height: "h-[20rem]" },
  { position: "top-[-60rem] right-[-60rem]", height: "h-[30rem]" },
];

const Hero1 = ({
  brand,
  logo,
  ctaLabel,
  onCtaClick,
  headline,
  subtitle,
  placeholder,
  inputLabel,
  submitLabel,
  suggestions,
  onSubmit,
  footnote,
  background,
  className,
}: Hero1Props) => {
  const [value, setValue] = React.useState("");
  const inputId = React.useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (text) onSubmit(text);
  }

  return (
    <div
      className={cn(
        "relative isolate flex h-full min-h-full flex-col overflow-x-hidden overflow-y-auto bg-field-950 text-cream",
        "selection:bg-lime/30 selection:text-cream",
        className,
      )}
    >
      {background}

      {/* Gradient — ลำแสงยามเช้า */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 motion-safe:animate-[dawn_14s_ease-in-out_infinite_alternate]"
      >
        {BEAM_GROUPS.map((g) => (
          <div
            key={g.position}
            className={cn(
              "absolute flex gap-[10rem] rotate-[-20deg] skew-[-40deg] blur-[4rem] opacity-50",
              g.position,
            )}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("w-[10rem] bg-linear-90 from-straw to-lime", g.height)} />
            ))}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2.5">
          {logo ?? (
            <span className="grid size-8 place-items-center rounded-lg bg-leaf shadow-[0_6px_18px_rgba(0,0,0,.35)]">
              <Sprout className="size-[18px] text-cream" strokeWidth={2.2} aria-hidden />
            </span>
          )}
          <span className="text-lg font-bold tracking-tight">{brand}</span>
        </div>
        <button
          type="button"
          onClick={onCtaClick}
          className="cursor-pointer rounded-full bg-cream px-5 py-2 text-sm font-semibold text-field-950 transition-colors hover:bg-straw focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
        >
          {ctaLabel}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-6 text-center">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          {/* Headline */}
          <h1 className="font-display text-4xl font-semibold leading-[1.3] text-balance sm:text-5xl md:text-6xl">
            {headline}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-[58ch] text-base leading-relaxed text-pretty text-moss sm:text-lg">
            {subtitle}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-2xl pt-4">
            <label htmlFor={inputId} className="sr-only">
              {inputLabel}
            </label>
            <div className="flex items-center rounded-full border border-lime/15 bg-field-800 p-2 pl-5 shadow-[0_18px_50px_-12px_rgba(0,0,0,.6)] transition-colors focus-within:border-lime/50">
              <Search className="size-5 shrink-0 text-lime" aria-hidden />
              <input
                id={inputId}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-2 pl-3 pr-2 text-base text-cream caret-lime outline-none placeholder:text-moss/70"
              />
              <button
                type="submit"
                disabled={!value.trim()}
                aria-label={submitLabel}
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-lime text-field-950 transition-[background-color,opacity] hover:bg-straw focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-lime"
              >
                <ArrowUp className="size-5" strokeWidth={2.4} aria-hidden />
              </button>
            </div>
          </form>

          {/* Suggestion pills */}
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSubmit(s)}
                className="cursor-pointer rounded-full border border-lime/10 bg-field-800/80 px-4 py-2 text-sm text-balance text-moss transition-colors hover:border-lime/30 hover:bg-field-700 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                {s}
              </button>
            ))}
          </div>

          {footnote && <p className="pt-2 text-xs text-moss/75">{footnote}</p>}
        </div>
      </main>
    </div>
  );
};

export { Hero1 };

export default Hero1;
