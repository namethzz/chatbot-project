import React from "react";
import { CROPS } from "../utils/constants.js";
import { CropIcons } from "./CropIcons.jsx";

export default function CropFilterBar({ active, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 28px",
        overflowX: "auto",
        flexShrink: 0,
        borderBottom: "1px solid rgba(74,44,26,.08)",
        background: "rgba(245,239,224,.72)",
        scrollbarWidth: "none",
        position: "relative",
        zIndex: 10,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "var(--hint)",
          whiteSpace: "nowrap",
          fontWeight: 700,
          letterSpacing: ".05em",
          flexShrink: 0,
          marginRight: 2,
        }}
      >
        พืช :
      </span>

      {CROPS.map((c) => {
        const isActive = active === c.key;
        const IconComp = CropIcons[c.icon];

        return (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 14px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
              cursor: "pointer",
              transition: "all .18s ease",
              border: isActive
                ? "1.5px solid var(--leaf)"
                : "1.5px solid rgba(74,44,26,.10)",
              background: isActive ? "var(--leaf)" : "rgba(255,255,255,.82)",
              color: isActive ? "#fff" : "var(--soil)",
              outline: "none",
              boxShadow: isActive
                ? "0 8px 18px rgba(59,107,53,.18)"
                : "0 2px 8px rgba(44,26,14,.03)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: 999,
                background: isActive
                  ? "rgba(255,255,255,.18)"
                  : "rgba(59,107,53,.08)",
                color: isActive ? "#fff" : "inherit",
                flexShrink: 0,
              }}
            >
              {IconComp ? <IconComp /> : null}
            </span>

            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}