import { cn } from "@/lib/utils";

// ไอคอนแอป (คนปลูกต้นไม้บนพื้นเหลือง) — ไฟล์อยู่ที่ public/icon-*.png
export default function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/icon-192.png"
      alt=""
      width={192}
      height={192}
      draggable={false}
      className={cn("size-8 shrink-0 select-none", className)}
    />
  );
}
