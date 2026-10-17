import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDemo } from "@/utils/api.js";

interface TopBarProps {
  title: string;
  backendOk: boolean | null;
  onMenu: () => void;
}

export default function TopBar({ title, backendOk, onMenu }: TopBarProps) {
  const status = isDemo
    ? { label: "โหมดเดโม", dot: "bg-straw" }
    : backendOk === null
      ? { label: "กำลังตรวจสอบระบบ", dot: "bg-moss/60" }
      : backendOk
        ? { label: "เชื่อมต่อแล้ว", dot: "bg-lime" }
        : { label: "ระบบออฟไลน์", dot: "bg-red-400" };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-lime/10 px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="เปิดเมนู"
        className="-ml-1 grid size-9 cursor-pointer place-items-center rounded-lg text-moss hover:bg-field-800 hover:text-cream md:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-cream">{title}</h1>
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-lime/15 px-3 py-1 text-xs text-moss">
        <span className={cn("size-1.5 rounded-full", status.dot)} aria-hidden />
        {status.label}
        <span className="hidden text-moss/60 sm:inline">· 14 พืช · 46,340 เอกสาร</span>
      </span>
    </header>
  );
}
