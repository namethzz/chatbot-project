import * as React from "react";
import { CircleAlert, X } from "lucide-react";

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  return (
    <div
      role="alert"
      className="fixed bottom-28 left-1/2 z-50 flex w-[min(92vw,28rem)] -translate-x-1/2 items-start gap-3 rounded-xl border border-red-300/30 bg-[#2a1310] px-4 py-3 text-sm text-red-100 shadow-[0_12px_32px_rgba(0,0,0,.45)] animate-[fadeUp_.25s_ease-out]"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden />
      <p className="min-w-0 flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="ปิดข้อความแจ้งเตือน"
        className="-m-1 grid size-6 cursor-pointer place-items-center rounded-md text-red-200 hover:bg-white/10"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
