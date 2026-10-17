# Economic Crops Chat — พี่เกษตร 🌾

แชทบอทแนะนำการปลูกพืชเศรษฐกิจไทย 14 ชนิด ตอบเรื่องพื้นที่เหมาะสม วิธีปลูก และโรค/ศัตรูพืช ด้วย RAG

```
frontend (React + Vite :5173) → backend (Express + MongoDB :4000) → RAG API (FastAPI :8000) → Ollama (qwen2.5:7b)
```

## สิ่งที่ต้องมี

- Node.js 18+
- Python 3.10+
- MongoDB (local หรือ Atlas)
- [Ollama](https://ollama.com) แล้วรัน `ollama pull qwen2.5:7b`

## วิธีรัน

### 1. RAG API

```bash
cd RAG
pip install -r requirements.txt

# ครั้งแรก (หรือหลังข้อมูลใน data/cleaned เปลี่ยน) ให้สร้าง Vector DB ใหม่
REBUILD_DB=1 python rag_prototype.py

# ครั้งต่อไป
python rag_prototype.py
```

- ถ้า `chroma_db/` ยังว่าง ระบบจะโหลดข้อมูลให้เองตอนเปิด (ใช้เวลานาน เพราะต้อง embed ~46,000 เอกสาร)
- ตั้งค่า Ollama ได้ด้วย env `OLLAMA_URL` และ `OLLAMA_MODEL`
- ถ้าแก้ไฟล์ CSV ใน `data/RawData` ให้รัน `python dataset_local.py` เพื่อสร้าง `data/cleaned/land_suit_rag_full.jsonl` ใหม่ แล้วค่อย `REBUILD_DB=1`

### 2. Backend

```bash
cd backend
cp .env.example .env   # แก้ MONGODB_URI / RAG_API_URL ตามเครื่อง
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # เปิด http://localhost:5173
```

## โครงสร้าง

| โฟลเดอร์ | หน้าที่ |
|---|---|
| `RAG/dataset_local.py` | แปลง CSV พื้นที่เหมาะสมใน `data/RawData` → เอกสาร RAG |
| `RAG/rag_prototype.py` | API `/ask`: แยกเจตนาคำถาม → ค้นใน ChromaDB → ให้ LLM ตอบ |
| `RAG/constants.py` | รายชื่อพืช/จังหวัด และตัวช่วย normalize ภาษาไทย ที่ใช้ร่วมกัน |
| `backend/` | เก็บประวัติแชทและสถิติใน MongoDB, ส่งคำถามต่อให้ RAG |
| `frontend/` | หน้าเว็บแชท |

> ⚠️ backend ยังไม่มีระบบผู้ใช้ — ทุกคนที่เข้าถึง API ได้จะเห็นและลบ session ของทุกคนได้ ระวังถ้าเปิดออกอินเทอร์เน็ต
