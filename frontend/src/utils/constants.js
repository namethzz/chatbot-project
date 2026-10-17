// ─── 14 พืชเศรษฐกิจไทย ────────────────────────────────
export const CROPS = [
  { key: 'ข้าว', label: 'ข้าว', icon: 'rice' },
  { key: 'ข้าวโพด', label: 'ข้าวโพด', icon: 'corn' },
  { key: 'มันสำปะหลัง', label: 'มันสำปะหลัง', icon: 'cassava' },
  { key: 'อ้อย', label: 'อ้อย', icon: 'sugarcane' },
  { key: 'สับปะรด', label: 'สับปะรด', icon: 'pineapple' },
  { key: 'ยางพารา', label: 'ยางพารา', icon: 'rubber' },
  { key: 'ทุเรียน', label: 'ทุเรียน', icon: 'durian' },
  { key: 'มังคุด', label: 'มังคุด', icon: 'mangosteen' },
  { key: 'ลำไย', label: 'ลำไย', icon: 'longan' },
  { key: 'ปาล์มน้ำมัน', label: 'ปาล์มน้ำมัน', icon: 'palm' },
  { key: 'มะพร้าว', label: 'มะพร้าว', icon: 'coconut' },
  { key: 'กาแฟโรบัสต้า', label: 'กาแฟโรบัสต้า', icon: 'coffee' },
  { key: 'กาแฟอาราบิก้า', label: 'กาแฟอาราบิก้า', icon: 'coffee' },
  { key: 'เงาะ', label: 'เงาะ', icon: 'rambutan' },
]

// ─── คำถามตัวอย่าง (หน้าแรก + หน้าแชทว่าง) ─────────────
// kind ใช้เลือกไอคอน (ดู components/chat/meta.ts)
export const QUICK_PROMPTS = [
  { kind: 'land',  title: 'พื้นที่เหมาะสม',   q: 'มะพร้าวปลูกได้ที่จังหวัดไหนบ้างในภาคใต้' },
  { kind: 'guide', title: 'วิธีปลูก',         q: 'วิธีปลูกทุเรียนและการดูแลที่ถูกต้อง' },
  { kind: 'pest',  title: 'โรคและแมลง',      q: 'ข้าวเป็นโรคอะไรได้บ้าง มีอาการอย่างไร' },
  { kind: 'multi', title: 'กาแฟ 2 สายพันธุ์', q: 'กาแฟโรบัสต้ากับอาราบิก้าต่างกันอย่างไร ปลูกที่ไหนได้บ้าง' },
]

// ─── คำที่กดแทรกในช่องพิมพ์ ─────────────────────────
export const HINT_TAGS = [
  { kind: 'land',  label: 'พื้นที่เหมาะสม', insert: 'พื้นที่เหมาะสม' },
  { kind: 'guide', label: 'วิธีปลูก',       insert: 'วิธีปลูก' },
  { kind: 'pest',  label: 'โรคและแมลง',    insert: 'โรคและแมลง' },
  { kind: 'guide', label: 'ใส่ปุ๋ย',         insert: 'การใส่ปุ๋ย' },
  { kind: 'guide', label: 'เก็บเกี่ยว',      insert: 'การเก็บเกี่ยว' },
]
