// ─── Demo mode ────────────────────────────────────────
// ใช้ตอน deploy หน้าเว็บอย่างเดียว (ไม่มี backend / RAG / LLM)
// คำตอบด้านล่างเรียบเรียงจากข้อมูลจริงใน RAG/data/cleaned — ไม่ได้มาจาก AI สด
// เปิดใช้ด้วย VITE_DEMO_MODE=true (ดู frontend/.env.production)

const DEMO_ANSWERS = [
  {
    match: q => q.includes('มะพร้าว') && /ภาคใต้|ที่ไหน|จังหวัด/.test(q),
    intent: 'land',
    cropName: 'มะพร้าว',
    sources: ['land_suitability'],
    docsUsed: 5,
    highlight: 'กระบี่มีพื้นที่เหมาะสมสูงสำหรับมะพร้าวที่ยังไม่ได้ใช้ปลูกมากที่สุดในภาคใต้',
    content: `พื้นที่เหมาะสมสูงสำหรับมะพร้าวในภาคใต้ (ข้อมูลระดับจังหวัด):
- กระบี่: เหมาะสมสูง 156,505.67 ไร่ (ยังไม่ได้ใช้ปลูก)
- สุราษฎร์ธานี: เหมาะสมสูง 45,234 ไร่ และเหมาะสมปานกลางที่ปลูกอยู่แล้ว 49,992 ไร่
- ชุมพร: เหมาะสมสูง 39,324 ไร่ และเหมาะสมปานกลางที่ปลูกอยู่แล้ว 76,064 ไร่
- นครศรีธรรมราช: เหมาะสมสูง 17,053 ไร่ และเหมาะสมปานกลางที่ปลูกอยู่แล้ว 112,604 ไร่
- ระนอง: เหมาะสมสูง 2,641 ไร่
ถ้าบอกอำเภอที่สนใจ พี่เกษตรดูข้อมูลรายอำเภอให้ได้ครับ`,
  },
  {
    match: q => q.includes('ทุเรียน') && /ปลูก|ดูแล|ปุ๋ย/.test(q),
    intent: 'guide',
    cropName: 'ทุเรียน',
    sources: ['growing_guide'],
    docsUsed: 5,
    content: `การปลูกและดูแลทุเรียน:
- เตรียมดิน: ที่ลุ่มให้ยกร่องสวน สันร่องกว้างไม่น้อยกว่า 6 เมตร ที่ดอนให้ไถพรวนและขุดร่องระบายน้ำ ดินควรมี pH 5.5–6.5 และน้ำไม่ท่วมขัง
- ต้นพันธุ์: แข็งแรง ไม่ค้างปี ต้นตอเป็นพันธุ์พื้นเมืองที่ทนโรครากเน่าโคนเน่า
- การปลูก: ขุดหลุม 50 x 50 x 50 ซม. ระยะปลูก 8 x 8 ถึง 10 x 10 เมตร (ประมาณ 16–25 ต้นต่อไร่)
- ปุ๋ย: ปุ๋ยคอกปีละ 2.25 กก. แบ่งใส่ 2 ครั้ง และปุ๋ยเคมีสูตร 15-15-15 หรือ 16-16-16 ปีละ 1 กก. ต่อต้น
- เก็บเกี่ยว: นับจากวันดอกบาน กระดุมทอง 90–100 วัน ชะนี 105–110 วัน หมอนทอง 120–135 วัน`,
  },
  {
    match: q => q.includes('ข้าว') && !q.includes('ข้าวโพด') && /โรค|แมลง|อาการ/.test(q),
    intent: 'pest',
    cropName: 'ข้าว',
    sources: ['pest_info', 'growing_guide'],
    docsUsed: 5,
    content: `โรคข้าวที่พบบ่อย:
- โรคไหม้: พบระยะกล้า แตกกอ และออกรวง ทำลายใบ ข้อต่อ และคอรวง ใบเป็นแผลจุดสีน้ำตาลคล้ายรูปตา ตรงกลางสีเทา ถ้ารุนแรงต้นกล้าแห้งตายคล้ายถูกไฟไหม้
- โรคใบจุดสีน้ำตาล: พบมากระยะแตกกอ ทำลายใบ แผลเป็นจุดสีน้ำตาลรูปกลมหรือรูปไข่ ขอบแผลสีเหลือง
- โรคใบหงิก (โรคจู๋): พบได้ทุกระยะ ทำลายใบและกาบใบ ต้นเตี้ย ใบเขียวเข้ม แคบ สั้น ปลายใบบิดเป็นเกลียว
- โรคเมล็ดด่าง: พบระยะออกรวงถึงเก็บเกี่ยว ทำลายเมล็ด มีจุดสีน้ำตาลหรือดำบนเมล็ด`,
  },
  {
    match: q => q.includes('กาแฟ') || q.includes('อาราบิก้า') || q.includes('โรบัสต้า'),
    intent: 'multi',
    cropName: 'กาแฟ',
    sources: ['land_suitability', 'growing_guide'],
    docsUsed: 5,
    content: `ในระบบแยกข้อมูลกาแฟเป็น 2 สายพันธุ์ จังหวัดที่มีพื้นที่เหมาะสมสูงมากที่สุด:
- กาแฟอาราบิก้า: เชียงราย 243,651 ไร่, สระแก้ว 113,973 ไร่, อุบลราชธานี 107,323 ไร่
- กาแฟโรบัสต้า: ลพบุรี 629,587 ไร่, นครสวรรค์ 393,206 ไร่, สระบุรี 127,715 ไร่
ตัวเลขเป็นพื้นที่ที่ดินเหมาะสมแต่ยังไม่ได้ปลูก ถามต่อได้ว่าจังหวัดที่สนใจเหมาะกับสายพันธุ์ไหนครับ`,
  },
]

const FALLBACK = {
  intent: 'general',
  sources: [],
  docsUsed: 0,
  content: `เว็บนี้เป็นโหมดเดโม ตอบได้เฉพาะคำถามตัวอย่างครับ ลองกดคำถามในหน้าแรก หรือถามเรื่อง:
- มะพร้าวปลูกที่ไหนในภาคใต้
- วิธีปลูกทุเรียน
- โรคข้าว
- กาแฟอาราบิก้ากับโรบัสต้า
ระบบเต็ม (ค้นข้อมูลจริง 46,340 เอกสาร + AI) ดูวิธีติดตั้งได้ใน README ของโปรเจกต์`,
}

const STORAGE_KEY = 'agri-demo-sessions'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function save(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)) } catch { /* private mode */ }
}

let sessions = load()
const newId = () => 'demo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const now = () => new Date().toISOString()
const wait = ms => new Promise(r => setTimeout(r, ms))
const summary = s => ({ _id: s._id, title: s.title, cropFocus: s.cropFocus, msgCount: s.messages.length, updatedAt: s.updatedAt })

function findSession(id) {
  const s = sessions.find(s => s._id === id)
  if (!s) throw new Error('ไม่พบ session')
  return s
}

export const getSessions   = async () => [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(summary)
export const createSession = async () => summary(newSession())
export const getSession    = async (id) => findSession(id)

export async function renameSession(id, title) {
  const s = findSession(id)
  s.title = title.trim().slice(0, 60)
  save(sessions)
  return { _id: s._id, title: s.title }
}

export async function deleteSession(id) {
  sessions = sessions.filter(s => s._id !== id)
  save(sessions)
  return { ok: true }
}

function newSession() {
  const s = { _id: newId(), title: 'สนทนาใหม่', cropFocus: null, messages: [], updatedAt: now() }
  sessions.push(s)
  return s
}

export async function sendMessage(question, sessionId) {
  const t0 = Date.now()
  await wait(700 + Math.random() * 600)  // ให้เห็น typing indicator เหมือนระบบจริง

  const q = question.trim()
  const s = sessions.find(s => s._id === sessionId) || newSession()
  const answer = DEMO_ANSWERS.find(a => a.match(q)) || FALLBACK

  const userMsg = { _id: newId(), role: 'user', content: q, createdAt: now() }
  const botMsg = {
    _id: newId(),
    role: 'bot',
    content: answer.content,
    intent: answer.intent,
    sources: answer.sources,
    cropName: answer.cropName || null,
    province: null,
    highlight: answer.highlight || null,
    docsUsed: answer.docsUsed,
    latencyMs: Date.now() - t0,
    createdAt: now(),
  }

  s.messages.push(userMsg, botMsg)
  if (s.title === 'สนทนาใหม่') s.title = q.slice(0, 44) + (q.length > 44 ? '…' : '')
  if (answer.cropName) s.cropFocus = answer.cropName
  s.updatedAt = now()
  save(sessions)

  return { sessionId: s._id, userMsg, botMsg }
}

export async function getStats() {
  const msgs = sessions.flatMap(s => s.messages)
  return {
    totalSessions: sessions.length,
    totalMessages: msgs.length,
    todayAsked: msgs.filter(m => m.role === 'user' && m.createdAt?.slice(0, 10) === now().slice(0, 10)).length,
    byIntent: {},
    byCrop: {},
  }
}

export const healthCheck = async () => ({ status: 'ok', demo: true })
