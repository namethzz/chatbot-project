import 'dotenv/config'
import express   from 'express'
import mongoose  from 'mongoose'
import cors      from 'cors'
import { Session, DailyStat } from './models.js'

const app  = express()
const PORT = process.env.PORT || 4000

// CORS_ORIGINS = URL ของ frontend คั่นด้วย , (เช่น https://xxx.vercel.app)
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',').map(o => o.trim().replace(/\/$/, '')).filter(Boolean)
app.use(cors({ origin: corsOrigins }))
app.use(express.json())

// ─── MongoDB ──────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))  // ไม่ log URI เพราะมีรหัสผ่านของ Atlas อยู่
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1) })

// ─── Helper: bump daily stats ─────────────────────────────
async function bumpStats(intent, cropName) {
  const date = new Date().toISOString().slice(0, 10)
  const update = { $inc: { totalAsked: 1 } }
  if (intent && intent !== 'pending') update.$inc[`byIntent.${intent}`] = 1
  if (cropName)                       update.$inc[`byCrop.${cropName}`]  = 1
  await DailyStat.findOneAndUpdate({ date }, update, { upsert: true }).catch(() => {})
}

// ─── Helper: call RAG Python backend ─────────────────────
async function callRAG(question) {
  try {
    const res = await fetch(process.env.RAG_API_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.RAG_API_KEY && { 'X-API-Key': process.env.RAG_API_KEY }),
      },
      body:    JSON.stringify({ question }),
      // นานหน่อยเผื่อ Hugging Face Space กำลังตื่นจากการหลับ
      signal:  AbortSignal.timeout(120_000),
    })
    if (!res.ok) throw new Error('RAG ' + res.status)
    const data = await res.json()
    // กัน RAG ตอบกลับมาแบบไม่มี answer (เช่น { error }) → ไม่งั้น save ไม่ผ่านเพราะ content required
    if (typeof data?.answer !== 'string' || !data.answer.trim()) throw new Error('RAG response has no answer')
    return data
  } catch (err) {
    // RAG ยังไม่พร้อม / error → return placeholder
    console.error('⚠️ RAG error:', err.message)
    return {
      answer:    '🔧 ระบบตอบคำถามยังไม่พร้อม (อาจกำลังเริ่มทำงาน ใช้เวลา 1–2 นาที) — กรุณาลองถามใหม่อีกครั้งครับ',
      intent:    'pending',
      crop_name: null,
      province:  null,
      sources:   [],
      highlight: null,
      docs_used: 0,
    }
  }
}

// ═══════════════════════════════════════════════
//  SESSION ROUTES
// ═══════════════════════════════════════════════

// GET  /api/sessions           → list (sidebar)
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session
      .find({}, 'title cropFocus msgCount updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50)
    res.json(sessions)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/sessions           → สร้าง session ใหม่
app.post('/api/sessions', async (req, res) => {
  try {
    const s = await Session.create({})
    res.status(201).json(s)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// GET  /api/sessions/:id       → messages ของ session
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const s = await Session.findById(req.params.id)
    if (!s) return res.status(404).json({ error: 'ไม่พบ session' })
    res.json(s)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// PATCH /api/sessions/:id/title  → เปลี่ยนชื่อ session
app.patch('/api/sessions/:id/title', async (req, res) => {
  try {
    const { title } = req.body
    if (!title?.trim()) return res.status(400).json({ error: 'title required' })
    const s = await Session.findByIdAndUpdate(
      req.params.id,
      { title: title.trim().slice(0, 60) },
      { new: true }
    )
    if (!s) return res.status(404).json({ error: 'ไม่พบ session' })
    res.json({ _id: s._id, title: s.title })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// DELETE /api/sessions/:id    → ลบ session
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ═══════════════════════════════════════════════
//  CHAT ROUTE
// ═══════════════════════════════════════════════

// POST /api/ask  { question, sessionId? }
app.post('/api/ask', async (req, res) => {
  const { question, sessionId } = req.body
  if (typeof question !== 'string' || !question.trim()) return res.status(400).json({ error: 'question required' })

  // Express 4 ไม่จับ error ของ async handler ให้ → ต้อง try/catch เอง ไม่งั้น process ล่มทั้งตัว
  try {
    const t0 = Date.now()

    // หา session หรือสร้างใหม่
    let session = sessionId ? await Session.findById(sessionId).catch(() => null) : null
    if (!session) session = new Session({})

    // push user message ก่อน
    session.messages.push({ role: 'user', content: question.trim() })

    // call RAG
    const rag     = await callRAG(question.trim())
    const latency = Date.now() - t0

    // push bot message
    const botMsg = {
      role:      'bot',
      content:   rag.answer,
      intent:    rag.intent    || 'pending',
      sources:   rag.sources   || [],
      cropName:  rag.crop_name || null,
      province:  rag.province  || null,
      highlight: rag.highlight || null,
      docsUsed:  rag.docs_used || 0,
      latencyMs: latency,
    }
    session.messages.push(botMsg)

    if (rag.crop_name) session.cropFocus = rag.crop_name
    await session.save()

    // fire-and-forget stats
    bumpStats(rag.intent, rag.crop_name)

    res.json({
      sessionId:  session._id,
      userMsg:    session.messages[session.messages.length - 2],
      botMsg:     session.messages[session.messages.length - 1],
    })
  } catch (e) {
    console.error('❌ /api/ask error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

// ═══════════════════════════════════════════════
//  STATS ROUTE
// ═══════════════════════════════════════════════

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const [agg]  = await Session.aggregate([
      { $group: { _id: null, sessions: { $sum: 1 }, messages: { $sum: '$msgCount' } } }
    ])
    const today = await DailyStat.findOne({ date: new Date().toISOString().slice(0, 10) })
    res.json({
      totalSessions: agg?.sessions   || 0,
      totalMessages: agg?.messages   || 0,
      todayAsked:    today?.totalAsked || 0,
      byIntent:      today?.byIntent   || {},
      byCrop:        today?.byCrop     ? Object.fromEntries(today.byCrop) : {},
    })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── Health check ─────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date() }))

app.listen(PORT, () => {
  console.log(`🌾 Backend → http://localhost:${PORT}`)
  console.log(`   RAG URL → ${process.env.RAG_API_URL}`)
})
