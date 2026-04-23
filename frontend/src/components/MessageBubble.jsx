import React from "react";
import { Icon } from "./Icons.jsx";
import Markdown from "react-markdown";
import { INTENT, SOURCE } from "../utils/constants.js";

export function TypingBubble() {
  return (
    <div
      style={{ alignSelf: "flex-start", animation: "fadeUp .3s ease forwards" }}
    >
      <BotMeta intent={null} latencyMs={0} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "12px 16px",
          background: "rgba(255,255,255,.92)",
          border: "1px solid rgba(74,44,26,.1)",
          borderRadius: "4px 18px 18px 18px",
          boxShadow: "var(--sh-sm)",
          width: "fit-content",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--sprout)",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MessageBubble({ msg, isLatest }) {
  if (msg.role === "user") return <UserBubble msg={msg} isLatest={isLatest} />;
  return <BotBubble msg={msg} isLatest={isLatest} />;
}

function cleanMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^\s*[\*\-]\s+/gm, '')
    .replace(/\*/g, '')
}

function UserBubble({ msg, isLatest }) {
  return (
    <div
      style={{
        alignSelf: "flex-end",
        maxWidth: "68%",
        animation: isLatest ? "fadeUp .28s ease forwards" : "none",
      }}
    >
      <div
        style={{
          background: "var(--soil)",
          color: "#F5EFE0",
          padding: "11px 16px",
          borderRadius: "18px 18px 4px 18px",
          fontSize: 14,
          lineHeight: 1.65,
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

function BotMeta({ intent, latencyMs }) {
  const cfg = intent ? INTENT[intent] : null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 7,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "var(--leaf)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name="leaf" size={15} color="#fff" />
      </div>
      <span
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--leaf)",
          letterSpacing: ".03em",
        }}
      >
        ที่ปรึกษาเกษตร
      </span>

      {cfg && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 10,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: ".03em",
            background: cfg.bg,
            color: cfg.color,
          }}
        >
          {cfg.label}
        </span>
      )}

      {latencyMs > 0 && (
        <span
          style={{ fontSize: 10, color: "var(--hint)", marginLeft: "auto" }}
        >
          {(latencyMs / 1000).toFixed(1)}s
        </span>
      )}
    </div>
  );
}

function BotBubble({ msg, isLatest }) {
  const lines = (msg.content || "").split("\n");

  return (
    <div
      style={{
        alignSelf: "flex-start",
        maxWidth: "78%",
        animation: isLatest ? "fadeUp .32s ease forwards" : "none",
      }}
    >
      <BotMeta intent={msg.intent} latencyMs={msg.latencyMs} />

      <div
        style={{
          background: "rgba(255,255,255,.92)",
          border: "1px solid rgba(74,44,26,.1)",
          borderRadius: "4px 18px 18px 18px",
          padding: "14px 18px",
          fontSize: 13.5,
          lineHeight: 1.8,
          color: "var(--text)",
          boxShadow: "var(--sh-sm)",
        }}
      >
        {/* Highlight bar */}
        {msg.highlight && (
          <div
            style={{
              background: "rgba(59,107,53,.08)",
              borderLeft: "3px solid var(--sprout)",
              borderRadius: "0 8px 8px 0",
              padding: "8px 12px",
              marginBottom: 12,
              fontSize: 13,
              color: "var(--soil)",
              fontWeight: 500,
            }}
          >
            {msg.highlight}
          </div>
        )}

        <div>
          {lines.map((line, i) => {
            const isBullet = /^[•\-\*]/.test(line);
            if (isBullet)
              return (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, marginBottom: 5 }}
                >
                  <span
                    style={{
                      color: "var(--sprout)",
                      flexShrink: 0,
                      fontWeight: 700,
                    }}
                  >
                    •
                  </span>
                  <span>{line.replace(/^[•\-\*]\s*/, "")}</span>
                </div>
              );
            return (
              <p key={i} style={{ marginBottom: i < lines.length - 1 ? 8 : 0 }}>
                <Markdown>{line}</Markdown>
              </p>
            );
          })}
        </div>

        {msg.sources?.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid rgba(74,44,26,.08)",
            }}
          >
            {msg.sources.map((s) => {
              const c = SOURCE[s];
              if (!c) return null;
              return (
                <span
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 9px",
                    borderRadius: 8,
                    fontSize: 10.5,
                    fontWeight: 500,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    color: c.color,
                  }}
                >
                  {c.label}
                </span>
              );
            })}

            {msg.docsUsed > 0 && (
              <span
                style={{
                  fontSize: 10,
                  color: "var(--hint)",
                  marginLeft: "auto",
                  alignSelf: "center",
                }}
              >
                {msg.docsUsed} docs
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
