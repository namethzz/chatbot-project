import * as React from "react";
import { Hero1 } from "@/components/ui/hero-1";
import { QUICK_PROMPTS } from "@/utils/constants.js";
import { isDemo } from "@/utils/api.js";

interface LandingProps {
  /** เปิดหน้าแชท ถ้ามีคำถามติดมาด้วยให้ส่งคำถามนั้นทันที */
  onStart: (question?: string) => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <Hero1
      brand="ที่ปรึกษาเกษตรกร"
      ctaLabel="เริ่มคุย"
      onCtaClick={() => onStart()}
      headline={
        <>
          ถามเรื่องปลูกพืช
          <br />
          ได้คำตอบจากข้อมูลจริง
        </>
      }
      subtitle={
        <>
          ค้นข้อมูลพื้นที่เหมาะสม วิธีปลูก และโรคพืชของพืชเศรษฐกิจไทย 14 ชนิด
          <br className="hidden sm:inline" /> แล้วสรุปเป็นคำตอบที่อ่านง่าย
        </>
      }
      placeholder="เช่น ทุเรียนปลูกที่ระยองได้ไหม"
      inputLabel="พิมพ์คำถามเรื่องการปลูกพืช"
      submitLabel="ส่งคำถาม"
      suggestions={QUICK_PROMPTS.map((p: { q: string }) => p.q)}
      onSubmit={(q) => onStart(q)}
      footnote={
        isDemo
          ? "โหมดเดโม — ตอบคำถามตัวอย่างด้านบนด้วยข้อมูลจริงจากโปรเจกต์"
          : "ค้นจากข้อมูล 46,340 เอกสาร ครอบคลุม 77 จังหวัด"
      }
      background={<FieldContours />}
    />
  );
}

// ─── พื้นหลัง: เส้นชั้นความสูงแบบแผนที่ความเหมาะสมของที่ดิน ─────────────
const WIDTH = 1440;
const LINES = 16;

function contourPath(i: number) {
  const base = 470 + i * 30;
  const points: string[] = [];
  for (let x = -40; x <= WIDTH + 40; x += 24) {
    const y =
      base +
      Math.sin(x / 210 + i * 0.55) * (16 + i * 1.6) +
      Math.sin(x / 83 + i * 1.3) * 5 +
      Math.cos(x / 420 - i * 0.3) * 22;
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
}

function FieldContours() {
  const paths = React.useMemo(() => Array.from({ length: LINES }, (_, i) => contourPath(i)), []);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${WIDTH} 1000`}
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 -z-20 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_30%,black_85%)]"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--color-lime)"
          strokeOpacity={0.1 + (i / LINES) * 0.22}
          strokeWidth={i % 4 === 3 ? 1.6 : 1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
