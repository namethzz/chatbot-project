import {
  BookOpen, Bug, CircleHelp, Clock, Layers, Map, MessageCircle, Sprout,
  type LucideIcon,
} from "lucide-react";

export interface ChatMessage {
  _id?: string;
  role: "user" | "bot";
  content: string;
  intent?: string;
  sources?: string[];
  highlight?: string | null;
  docsUsed?: number;
  latencyMs?: number;
}

export interface SessionSummary {
  _id: string;
  title: string;
  msgCount: number;
  updatedAt: string;
}

export interface ChatStats {
  totalSessions: number;
  totalMessages: number;
  todayAsked: number;
}

// ป้ายประเภทคำถามบนคำตอบของบอท
export const INTENT: Record<string, { label: string; icon: LucideIcon }> = {
  land:    { label: "พื้นที่เหมาะสม", icon: Map },
  guide:   { label: "วิธีปลูก",       icon: Sprout },
  pest:    { label: "โรคและแมลง",    icon: Bug },
  multi:   { label: "หลายประเภท",    icon: Layers },
  general: { label: "ทั่วไป",         icon: MessageCircle },
  pending: { label: "รอระบบ",        icon: Clock },
};

// แหล่งข้อมูลที่ใช้ตอบ
export const SOURCE: Record<string, { label: string; icon: LucideIcon }> = {
  land_suitability: { label: "ข้อมูลพื้นที่เหมาะสม", icon: Map },
  growing_guide:    { label: "คู่มือการปลูก",       icon: BookOpen },
  pest_info:        { label: "ฐานข้อมูลโรคและแมลง", icon: Bug },
};

export const KIND_ICON: Record<string, LucideIcon> = {
  land: Map, guide: Sprout, pest: Bug, multi: Layers,
};

export const FallbackIcon = CircleHelp;
