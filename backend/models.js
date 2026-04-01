import mongoose from 'mongoose'

// ─── Message (embedded ใน Session) ───────────────────────
const messageSchema = new mongoose.Schema(
  {
    role:      { type: String, enum: ['user', 'bot'], required: true },
    content:   { type: String, required: true },
    intent:    { type: String, enum: ['land', 'guide', 'pest', 'multi', 'general', 'pending'], default: 'pending' },
    sources:   [String],        // ['land_suitability', 'growing_guide', 'pest_info']
    cropName:  { type: String, default: null },
    province:  { type: String, default: null },
    highlight: { type: String, default: null },
    docsUsed:  { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// ─── Session ─────────────────────────────────────────────
const sessionSchema = new mongoose.Schema(
  {
    title:     { type: String, default: 'สนทนาใหม่' },
    cropFocus: { type: String, default: null },   // พืชหลักของ session นี้
    messages:  [messageSchema],
    msgCount:  { type: Number, default: 0 },
  },
  { timestamps: true }
)

// auto-set title จาก user message แรก
sessionSchema.pre('save', function (next) {
  const first = this.messages.find(m => m.role === 'user')
  if (first && this.title === 'สนทนาใหม่') {
    this.title = first.content.slice(0, 44) + (first.content.length > 44 ? '…' : '')
  }
  this.msgCount = this.messages.length
  next()
})

// ─── DailyStat ────────────────────────────────────────────
const dailyStatSchema = new mongoose.Schema(
  {
    date:        { type: String, required: true, unique: true }, // "YYYY-MM-DD"
    totalAsked:  { type: Number, default: 0 },
    byIntent:    {
      land:    { type: Number, default: 0 },
      guide:   { type: Number, default: 0 },
      pest:    { type: Number, default: 0 },
      multi:   { type: Number, default: 0 },
      general: { type: Number, default: 0 },
    },
    byCrop:      { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
)

export const Session    = mongoose.model('Session',    sessionSchema)
export const DailyStat  = mongoose.model('DailyStat',  dailyStatSchema)
