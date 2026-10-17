# Economic Crops Chat — พี่เกษตร 🌾

แชทบอทแนะนำการปลูกพืชเศรษฐกิจไทย 14 ชนิด ตอบเรื่องพื้นที่เหมาะสม วิธีปลูก และโรค/ศัตรูพืช ด้วย RAG

```
frontend (React + Vite) → backend (Express + MongoDB) → RAG API (FastAPI + ChromaDB + bge-m3) → Typhoon LLM API
   Vercel                    Render + MongoDB Atlas        Hugging Face Spaces
```

## รันในเครื่อง

สิ่งที่ต้องมี: Node.js 18+, Python 3.10+, MongoDB และ API key ของ [Typhoon](https://playground.opentyphoon.ai)

### 1. RAG API

```bash
cd RAG
pip install -r requirements.txt

python build_db.py                 # สร้าง Vector DB (ครั้งแรก หรือหลังข้อมูลใน data/cleaned เปลี่ยน) — ใช้เวลานาน
LLM_API_KEY=<typhoon key> python rag_prototype.py   # เปิดที่ http://localhost:8000
```

| env | ค่าเริ่มต้น | ใช้ทำอะไร |
|---|---|---|
| `LLM_API_KEY` | – | API key ของ Typhoon |
| `LLM_MODEL` | `typhoon-v2.5-30b-a3b-instruct` | ชื่อโมเดล |
| `LLM_BASE_URL` | `https://api.opentyphoon.ai/v1` | API ที่ใช้รูปแบบเดียวกับ OpenAI |
| `RAG_API_KEY` | – | ถ้าตั้งไว้ `/ask` ต้องส่ง header `X-API-Key` ตรงกัน |

อยากใช้ Ollama ในเครื่องแทน: `LLM_BASE_URL=http://localhost:11434/v1 LLM_MODEL=qwen2.5:7b python rag_prototype.py`

ถ้าแก้ไฟล์ CSV ใน `data/RawData` ให้รัน `python dataset_local.py` ก่อน แล้วค่อย `python build_db.py`

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

## Deploy ขึ้นเว็บ (ฟรีทั้งหมด)

ทำครั้งเดียวตามลำดับนี้ หลังจากนั้นทุกครั้งที่ merge เข้า `main` ระบบจะ deploy เอง

### 1. Typhoon API key
สมัครที่ [playground.opentyphoon.ai](https://playground.opentyphoon.ai) → สร้าง API key

### 2. RAG → Hugging Face Spaces
1. สมัคร [huggingface.co](https://huggingface.co) → Settings → Access Tokens → สร้าง token แบบ **Write**
2. ใน GitHub repo นี้ → Settings → Secrets and variables → Actions
   - แท็บ **Secrets**: เพิ่ม `HF_TOKEN` = token จากข้อ 1
   - แท็บ **Variables**: เพิ่ม `HF_SPACE_ID` = `<ชื่อผู้ใช้ HF>/agri-rag`
3. GitHub → Actions → **Deploy RAG to Hugging Face Spaces** → Run workflow
   ครั้งแรกใช้เวลานาน (ต้อง embed ~46,000 เอกสาร) ครั้งต่อไปถ้าข้อมูลไม่เปลี่ยนจะเร็ว
4. เปิด Space ที่ได้ → Settings → **Variables and secrets** → เพิ่ม secret
   - `LLM_API_KEY` = Typhoon key
   - `RAG_API_KEY` = ตั้งรหัสอะไรก็ได้ที่เดายาก (ใช้อีกทีในข้อ 4)
5. รอ Space build เสร็จ แล้วเปิด `https://<ชื่อผู้ใช้>-agri-rag.hf.space/` ต้องเห็น `RAG API is Online`

### 3. MongoDB Atlas
สร้าง cluster ฟรี (M0) ที่ [mongodb.com/atlas](https://www.mongodb.com/atlas) → สร้าง database user →
Network Access เพิ่ม `0.0.0.0/0` (Render ไม่มี IP คงที่) → คัดลอก connection string

### 4. Backend → Render
[render.com](https://render.com) → New → **Blueprint** → เลือก repo นี้ (ใช้ `render.yaml`) แล้วกรอก
- `MONGODB_URI` = connection string จาก Atlas
- `RAG_API_URL` = `https://<ชื่อผู้ใช้>-agri-rag.hf.space/ask`
- `RAG_API_KEY` = ค่าเดียวกับที่ตั้งใน Space
- `CORS_ORIGINS` = URL ของ frontend จากข้อ 5 (กลับมาใส่ทีหลังได้)

### 5. Frontend → Vercel
[vercel.com](https://vercel.com) → Add New Project → เลือก repo นี้
- Root Directory: `frontend`
- Environment Variable: `VITE_API_URL` = URL ของ backend บน Render เช่น `https://agri-chatbot-backend.onrender.com`

ได้ URL ของเว็บแล้วกลับไปใส่ใน `CORS_ORIGINS` ของ Render

> ⏰ แผนฟรีของ Render และ Hugging Face จะหลับเมื่อไม่มีคนใช้สักพัก คนแรกที่เข้าหลังจากนั้นต้องรอ 1–2 นาที

## โครงสร้าง

| ไฟล์ | หน้าที่ |
|---|---|
| `RAG/dataset_local.py` | แปลง CSV พื้นที่เหมาะสมใน `data/RawData` → เอกสาร RAG |
| `RAG/vector_db.py`, `RAG/build_db.py` | โมเดล embedding + ChromaDB และสคริปต์สร้าง DB |
| `RAG/rag_prototype.py` | API `/ask`: แยกเจตนาคำถาม → ค้นใน ChromaDB → ให้ LLM ตอบ |
| `RAG/constants.py` | รายชื่อพืช/จังหวัด และตัวช่วย normalize ภาษาไทย |
| `RAG/Dockerfile`, `.github/workflows/deploy-rag.yml` | deploy RAG ขึ้น Hugging Face Spaces |
| `backend/`, `render.yaml` | เก็บประวัติแชทและสถิติใน MongoDB, ส่งคำถามต่อให้ RAG |
| `frontend/` | หน้าเว็บแชท |

> ⚠️ backend ยังไม่มีระบบผู้ใช้ — ทุกคนที่เข้าเว็บได้จะเห็นและลบประวัติแชทของทุกคนได้
