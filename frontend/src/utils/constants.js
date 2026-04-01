// ─── 14 พืชเศรษฐกิจไทย ────────────────────────────────
export const CROPS = [
  { key: 'all',          label: 'ทั้งหมด',         emoji: '🌾' },
  { key: 'ข้าว',         label: 'ข้าว',             emoji: '🌾' },
  { key: 'ข้าวโพด',      label: 'ข้าวโพด',          emoji: '🌽' },
  { key: 'มันสำปะหลัง',  label: 'มันสำปะหลัง',      emoji: '🥔' },
  { key: 'อ้อย',         label: 'อ้อย',             emoji: '🎋' },
  { key: 'สับปะรด',      label: 'สับปะรด',          emoji: '🍍' },
  { key: 'ยางพารา',      label: 'ยางพารา',          emoji: '🌳' },
  { key: 'ทุเรียน',      label: 'ทุเรียน',          emoji: '🍈' },
  { key: 'มังคุด',       label: 'มังคุด',           emoji: '🟣' },
  { key: 'ลำไย',         label: 'ลำไย',             emoji: '🟡' },
  { key: 'ปาล์มน้ำมัน',  label: 'ปาล์มน้ำมัน',      emoji: '🌴' },
  { key: 'มะพร้าว',      label: 'มะพร้าว',          emoji: '🥥' },
  { key: 'กาแฟโรบัสต้า', label: 'กาแฟโรบัสต้า',    emoji: '☕' },
  { key: 'กาแฟอาราบิก้า',label: 'กาแฟอาราบิก้า',   emoji: '☕' },
  { key: 'เงาะ',         label: 'เงาะ',             emoji: '🔴' },
]

// ─── Quick-start prompts บนหน้า welcome ───────────────
export const QUICK_PROMPTS = [
  {
    icon: '🗺️',
    title: 'พื้นที่เหมาะสม',
    sub: 'ค้นหาจังหวัดที่เหมาะกับพืช',
    q: 'มะพร้าวปลูกได้ที่จังหวัดไหนบ้างในภาคใต้',
  },
  {
    icon: '🌱',
    title: 'วิธีปลูก',
    sub: 'ขั้นตอน ปุ๋ย น้ำ การดูแล',
    q: 'วิธีปลูกทุเรียนและการดูแลที่ถูกต้อง',
  },
  {
    icon: '🐛',
    title: 'ศัตรูพืช',
    sub: 'โรค แมลง อาการ วิธีรักษา',
    q: 'ข้าวเป็นโรคอะไรได้บ้าง มีอาการอย่างไร',
  },
  {
    icon: '☕',
    title: 'กาแฟ 2 สายพันธุ์',
    sub: 'โรบัสต้า vs อาราบิก้า',
    q: 'กาแฟโรบัสต้ากับอาราบิก้าต่างกันอย่างไร ปลูกที่ไหนได้บ้าง',
  },
]

// ─── Hint tags ใน input bar ───────────────────────────
export const HINT_TAGS = [
  { label: '📍 พื้นที่เหมาะสม', insert: 'พื้นที่เหมาะสม' },
  { label: '🌱 วิธีปลูก',       insert: 'วิธีปลูก' },
  { label: '🐛 โรคและแมลง',    insert: 'โรคและแมลง' },
  { label: '🌿 ใส่ปุ๋ย',        insert: 'การใส่ปุ๋ย' },
  { label: '🌾 เก็บเกี่ยว',     insert: 'การเก็บเกี่ยว' },
]

// ─── Intent badge config ──────────────────────────────
export const INTENT = {
  land:    { label: '🗺️ ที่ดิน',       bg: 'rgba(201,132,30,.13)', color: '#C9841E' },
  guide:   { label: '🌱 วิธีปลูก',     bg: 'rgba(59,107,53,.13)',  color: '#3B6B35' },
  pest:    { label: '🐛 ศัตรูพืช',     bg: 'rgba(155,43,26,.12)',  color: '#9B2B1A' },
  multi:   { label: '🌐 หลายประเภท',   bg: 'rgba(184,212,232,.35)',color: '#3A7A9B' },
  general: { label: '💬 ทั่วไป',        bg: 'rgba(160,128,96,.13)', color: '#6B5040' },
  pending: { label: '⏳ รอระบบ RAG',   bg: 'rgba(160,128,96,.10)', color: '#A08060' },
}

// ─── Source pill config ───────────────────────────────
export const SOURCE = {
  land_suitability: { label: '🗺️ Agri-Map',   bg: 'rgba(201,132,30,.08)', border: 'rgba(201,132,30,.28)', color: '#C9841E' },
  growing_guide:    { label: '📗 คู่มือปลูก', bg: 'rgba(59,107,53,.08)',  border: 'rgba(59,107,53,.28)',  color: '#3B6B35' },
  pest_info:        { label: '🐛 ศัตรูพืช',  bg: 'rgba(155,43,26,.08)',  border: 'rgba(155,43,26,.22)',  color: '#9B2B1A' },
}

// ─── Sidebar history intent → icon + bg ───────────────
export const HISTORY_ICON = {
  land:    { icon: '🗺️', bg: 'rgba(201,132,30,.15)' },
  guide:   { icon: '🌱', bg: 'rgba(59,107,53,.15)'  },
  pest:    { icon: '🐛', bg: 'rgba(155,43,26,.13)'  },
  multi:   { icon: '🌐', bg: 'rgba(184,212,232,.3)' },
  general: { icon: '💬', bg: 'rgba(160,128,96,.12)' },
  pending: { icon: '💬', bg: 'rgba(160,128,96,.12)' },
}
