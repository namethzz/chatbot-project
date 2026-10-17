import * as React from "react";
import Markdown from "react-markdown";
import { ArrowUpRight, Lightbulb, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUICK_PROMPTS } from "@/utils/constants.js";
import { FallbackIcon, INTENT, KIND_ICON, SOURCE, type ChatMessage } from "./meta";

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  bottomRef: React.RefObject<HTMLDivElement>;
  onQuick: (q: string) => void;
}

export default function MessageList({ messages, loading, bottomRef, onQuick }: MessageListProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
        {messages.length === 0 && !loading && <EmptyState onQuick={onQuick} />}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <UserMessage key={m._id || i} msg={m} />
          ) : (
            <BotMessage key={m._id || i} msg={m} />
          ),
        )}

        {loading && <Typing />}
        <div ref={bottomRef} className="h-px" />
      </div>
    </div>
  );
}

function EmptyState({ onQuick }: { onQuick: (q: string) => void }) {
  return (
    <div className="pt-[8vh]">
      <h1 className="font-display text-3xl font-semibold leading-snug sm:text-4xl">อยากรู้เรื่องอะไรดีครับ</h1>
      <p className="mt-3 max-w-[52ch] text-moss">
        ถามเรื่องพื้นที่เหมาะสม วิธีปลูก หรือโรคและแมลงของพืชเศรษฐกิจไทยได้เลย หรือเริ่มจากคำถามตัวอย่าง
      </p>
      <ul className="mt-8 divide-y divide-lime/10 border-y border-lime/10">
        {QUICK_PROMPTS.map((p: { kind: string; title: string; q: string }) => {
          const Icon = KIND_ICON[p.kind] ?? FallbackIcon;
          return (
            <li key={p.q}>
              <button
                type="button"
                onClick={() => onQuick(p.q)}
                className="group flex w-full cursor-pointer items-center gap-4 px-1 py-4 text-left transition-colors hover:bg-field-900/60 focus-visible:outline-2 focus-visible:outline-lime"
              >
                <Icon className="size-5 shrink-0 text-lime" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-moss/70">{p.title}</span>
                  <span className="block text-cream">{p.q}</span>
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-moss/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime"
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function UserMessage({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex justify-end animate-[fadeUp_.28s_ease-out]">
      <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-straw px-4 py-2.5 text-field-950 sm:max-w-[75%]">
        {msg.content}
      </p>
    </div>
  );
}

function BotAvatar() {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-leaf">
      <Sprout className="size-4 text-cream" strokeWidth={2.2} aria-hidden />
    </span>
  );
}

function BotMessage({ msg }: { msg: ChatMessage }) {
  const intent = msg.intent ? INTENT[msg.intent] : undefined;
  const lines = (msg.content || "").split("\n");

  return (
    <article className="flex gap-3 animate-[fadeUp_.32s_ease-out]">
      <BotAvatar />
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-2 text-xs text-moss/80">
          <span className="font-semibold text-lime">ที่ปรึกษาเกษตร</span>
          {intent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-field-800 px-2 py-0.5">
              <intent.icon className="size-3" aria-hidden />
              {intent.label}
            </span>
          )}
          {!!msg.latencyMs && (
            <span className="ml-auto tabular-nums text-moss/60">{(msg.latencyMs / 1000).toFixed(1)} วินาที</span>
          )}
        </header>

        <div className="mt-2 rounded-2xl rounded-tl-md border border-lime/10 bg-field-900 px-5 py-4 leading-[1.8] text-cream/95">
          {msg.highlight && (
            <p className="mb-3 flex gap-2 font-semibold text-straw">
              <Lightbulb className="mt-1 size-4 shrink-0" aria-hidden />
              {msg.highlight}
            </p>
          )}

          <div className="space-y-1.5">
            {lines.map((line, i) => {
              if (!line.trim()) return null;
              const isBullet = /^\s*[•\-*]\s+/.test(line);
              return isBullet ? (
                <div key={i} className="flex gap-2.5">
                  <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-lime" aria-hidden />
                  <div className="min-w-0 [&_strong]:text-straw">
                    <Markdown>{line.replace(/^\s*[•\-*]\s+/, "")}</Markdown>
                  </div>
                </div>
              ) : (
                <div key={i} className="[&_strong]:text-straw">
                  <Markdown>{line}</Markdown>
                </div>
              );
            })}
          </div>

          {!!msg.sources?.length && (
            <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-lime/10 pt-3 text-xs text-moss">
              <span className="text-moss/60">ที่มา</span>
              {msg.sources.map((s) => {
                const src = SOURCE[s];
                if (!src) return null;
                return (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full border border-lime/15 px-2 py-0.5">
                    <src.icon className="size-3 text-lime" aria-hidden />
                    {src.label}
                  </span>
                );
              })}
              {!!msg.docsUsed && <span className="ml-auto tabular-nums text-moss/60">{msg.docsUsed} เอกสาร</span>}
            </footer>
          )}
        </div>
      </div>
    </article>
  );
}

function Typing() {
  return (
    <div className="flex gap-3" role="status" aria-label="กำลังหาคำตอบ">
      <BotAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-lime/10 bg-field-900 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("size-1.5 rounded-full bg-lime motion-safe:animate-[bounce_1.2s_ease-in-out_infinite]")}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
