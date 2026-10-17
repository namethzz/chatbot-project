# -*- coding: utf-8 -*-
import os
import re
import secrets
import requests
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from constants import CROP_NAMES, CROP_NAMES_LONGEST_FIRST, normalize_thai, find_province
from vector_db import embed_model, get_collection, rebuild_db

# ==========================================
# ⚙️ SECTION 1: SETUP
# ==========================================

# LLM ที่ใช้ API แบบเดียวกับ OpenAI (/chat/completions) — ค่าเริ่มต้นคือ Typhoon
# อยากใช้ Ollama ในเครื่อง: LLM_BASE_URL=http://localhost:11434/v1 LLM_MODEL=qwen2.5:7b
LLM_BASE_URL = os.getenv('LLM_BASE_URL', 'https://api.opentyphoon.ai/v1').rstrip('/')
LLM_MODEL    = os.getenv('LLM_MODEL', 'typhoon-v2.5-30b-a3b-instruct')
LLM_API_KEY  = os.getenv('LLM_API_KEY', '')

# ถ้าตั้งไว้ /ask จะรับเฉพาะ request ที่ส่ง header X-API-Key ตรงกัน
# (กันคนอื่นยิง API ตรงๆ จนโควตา LLM หมด)
RAG_API_KEY = os.getenv('RAG_API_KEY', '')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # "*" ใช้คู่กับ credentials ไม่ได้ตามสเปก CORS (และ API นี้ไม่ใช้ cookie)
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 📦 SECTION 2: VECTOR DB (อยู่ใน vector_db.py)
# ==========================================

# 💡 สร้าง/โหลดข้อมูลใหม่: python build_db.py (หรือรันด้วย REBUILD_DB=1)
if os.getenv('REBUILD_DB') == '1' or get_collection().count() == 0:
    rebuild_db()

# ==========================================
# 🔍 SECTION 3: RETRIEVER
# ==========================================

# CROP_NAMES / ALL_PROVINCES / find_province อยู่ใน constants.py
COFFEE_TYPES = ['กาแฟโรบัสต้า', 'กาแฟอาราบิก้า']

LAND_KEYWORDS  = ['เหมาะสม', 'ปลูกได้', 'ที่ดิน', 'พื้นที่', 'จังหวัด', 'อำเภอ', 'ภาค', 'ไร่', 'แถว', 'ที่ไหน', 'อยู่ที่', 'ปลูกที่']
GUIDE_KEYWORDS = ['ปลูกยังไง', 'วิธีปลูก', 'การปลูก', 'ปุ๋ย', 'รดน้ำ', 'ดูแล', 'เก็บเกี่ยว', 'ระยะ', 'ดิน', 'อุณหภูมิ', 'ฝน', 'ผลผลิต', 'พันธุ์', 'กี่วัน']
PEST_KEYWORDS  = ['โรค', 'แมลง', 'ศัตรู', 'อาการ', 'ทำลาย', 'ระบาด', 'เชื้อ', 'รักษา', 'ป้องกัน', 'หนอน', 'เพลี้ย', 'เน่า', 'ใบไหม้', 'ใบจุด', 'เหี่ยว', 'ตาย',
                  # ใช้ 'ไร' เฉยๆ ไม่ได้ เพราะไปตรงกับ "อะไร" / "ไร่"
                  'ไรแดง', 'ไรขาว', 'ไรสี่ขา']

# ==========================================
# 🚦 SECTION 2.5: TOPIC GUARD
# ==========================================

# ใช้เฉพาะคำที่เจาะจงเรื่องเกษตร — คำสั้นๆ อย่าง 'ไร' 'นา' 'ใบ' 'ผล' 'น้ำ' 'ดิน'
# เป็นส่วนหนึ่งของคำทั่วไป ("อะไร", "ผลบอล", "น้ำหนัก", "เดิน") ทำให้ทุกคำถามผ่าน
AGRI_KEYWORDS = (
    CROP_NAMES
    + [
        'เกษตร', 'ชาวนา', 'ชาวสวน', 'ชาวไร่', 'ทำนา', 'ทำสวน', 'ทำไร่', 'ไร่', 'ฟาร์ม',
        'พืช', 'ต้นไม้', 'เมล็ด', 'ต้นกล้า', 'เพาะ', 'ปลูก', 'ปุ๋ย', 'ลำต้น',
        'เก็บเกี่ยว', 'ผลผลิต', 'ชลประทาน', 'รดน้ำ', 'ยาฆ่าแมลง', 'สารกำจัด',
        'หว่าน', 'ตัดแต่ง', 'ไถนา', 'ไถพรวน', 'ที่ดิน', 'หน้าดิน', 'สภาพดิน',
        'ดินเปรี้ยว', 'ดินเค็ม', 'ดินร่วน', 'ดินเหนียว', 'ดินทราย', 'พันธุ์',
        'โรค', 'แมลง', 'ศัตรู', 'เพลี้ย', 'หนอน', 'ไรแดง', 'ไรขาว', 'ระบาด',
        'ใบไหม้', 'ใบจุด', 'ใบเหลือง', 'รากเน่า', 'โคนเน่า', 'ผลเน่า', 'เหี่ยว',
    ]
)

OFF_TOPIC_SYSTEM_PROMPT = """คุณคือ "พี่เกษตร" ผู้ช่วย AI ด้านการเกษตรของประเทศไทย ที่มีบุคลิกเป็นมิตร อบอุ่น และเป็นกันเอง

ผู้ใช้ถามคำถามที่ไม่เกี่ยวกับการเกษตร ให้ทำดังนี้:
1. ทักทายหรือรับรู้คำถามของเขาอย่างเป็นธรรมชาติก่อน ไม่ต้องแข็งกระด้าง
2. บอกอย่างสุภาพว่าพี่เกษตรเชี่ยวชาญเฉพาะด้านเกษตรเท่านั้น
3. แนะนำสิ่งที่พี่เกษตรช่วยได้ โดยเชื่อมโยงกับคำถามของเขาถ้าทำได้ เช่น ถ้าถามเรื่องอาหาร ก็อาจชวนคุยเรื่องพืชที่ใช้ทำอาหารนั้น
4. ตอบเป็นภาษาไทยเท่านั้น กระชับ เป็นกันเอง ไม่เกิน 3-4 ประโยค
5. ห้ามขึ้นต้นด้วยคำว่า "น้อง"
"""

def is_agriculture_related(question: str) -> bool:
    """คืนค่า True ถ้าคำถามเกี่ยวข้องกับเกษตรกรรม"""
    q = normalize_thai(question).lower()
    return find_province(q) is not None or any(kw.lower() in q for kw in AGRI_KEYWORDS)


# ถามเรื่องแมลง/โรค ให้ดึงจากทั้งไฟล์ Pest และไฟล์ Guide (เผื่อมีข้อมูลซ้อนกัน)
INTENT_DATA_TYPES = {
    'land':  ['land_suitability'],
    'guide': ['growing_guide'],
    'pest':  ['pest_info', 'growing_guide'],
}

def parse_intent(question: str) -> dict:
    q = normalize_thai(question).lower()

    # เช็กชื่อยาวก่อน ไม่งั้น "ข้าวโพด" จะถูกจับเป็น "ข้าว"
    crop_found = next((c for c in CROP_NAMES_LONGEST_FIRST if c in q), None)
    if crop_found in (None, 'กาแฟ'):
        if 'อาราบิก้า' in q:  crop_found = 'กาแฟอาราบิก้า'
        elif 'โรบัสต้า' in q: crop_found = 'กาแฟโรบัสต้า'

    province_found = find_province(q)

    amphoe_found = None
    amphoe_match = re.search(r'(?:อำเภอ|อ\.)\s*([ก-๙a-zA-Z]+)', q)
    if amphoe_match:
        amphoe_found = amphoe_match.group(1)
        if amphoe_found == 'เมือง' and province_found:
            amphoe_found = f'เมือง{province_found}'

    land_score  = sum(1 for kw in LAND_KEYWORDS  if kw in q)
    guide_score = sum(1 for kw in GUIDE_KEYWORDS if kw in q)
    pest_score  = sum(1 for kw in PEST_KEYWORDS  if kw in q)

    if province_found or amphoe_found: land_score += 3
    scores = {'land': land_score, 'guide': guide_score, 'pest': pest_score}
    max_score = max(scores.values())
    top = [k for k, v in scores.items() if v == max_score]

    if max_score == 0 or len(top) == 3:
        intent, data_types = 'general', ['land_suitability', 'growing_guide', 'pest_info']
    elif len(top) == 1:
        intent, data_types = top[0], INTENT_DATA_TYPES[top[0]]
    else:
        # คะแนนเท่ากัน 2 ประเภท → ดึงข้อมูลจากทั้งสองประเภท
        intent = 'multi'
        data_types = list(dict.fromkeys(t for k in top for t in INTENT_DATA_TYPES[k]))

    return {
        'crop_name': crop_found, 
        'province': province_found, 
        'amphoe': amphoe_found, 
        'intent': intent, 
        'data_types': data_types
    }

def retrieve(question: str, n_results: int = 5) -> dict:
    intent_info = parse_intent(question)
    crop = intent_info['crop_name']
    prov = intent_info['province']
    intent = intent_info['intent']
    dtypes = intent_info['data_types']

    collection = get_collection()
    total = collection.count()
    if total == 0:
        print('⚠️ Vector DB ว่าง — รัน python build_db.py เพื่อโหลดข้อมูล')
        return {'intent_info': intent_info, 'docs': [], 'metadatas': []}

    # 1. บังคับหาชนิดพืช ("กาแฟ" เฉยๆ = ได้ทั้งโรบัสต้าและอาราบิก้า)
    crop_condition = None
    if crop == 'กาแฟ':
        crop_condition = {'crop_name': {'$in': COFFEE_TYPES}}
    elif crop:
        crop_condition = {'crop_name': {'$eq': crop}}

    where_conditions = [crop_condition] if crop_condition else []

    # 2. บังคับจังหวัดเฉพาะเรื่องที่ดิน
    if prov and intent == 'land':
        where_conditions.append({'province': {'$eq': prov}})

    # 3. กรองประเภทข้อมูลตาม intent
    if intent != 'general':
        where_conditions.append({'data_type': {'$in': dtypes}})

    def to_where(conditions):
        if not conditions:      return None
        if len(conditions) == 1: return conditions[0]
        return {'$and': conditions}

    query_embedding = embed_model.encode([question]).tolist()

    def query(where):
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=min(n_results, total),
            where=where,
            include=['documents', 'metadatas']
        )
        return results['documents'][0], results['metadatas'][0]

    try:
        docs, metas = query(to_where(where_conditions))
    except Exception as e:
        # อย่าทิ้งตัวกรองพืช ไม่งั้นจะได้ข้อมูลของพืชอื่นมาตอบ
        print(f'⚠️ query พร้อมตัวกรองล้มเหลว ({e}) — ลองใหม่โดยกรองแค่ชนิดพืช')
        docs, metas = query(crop_condition)

    return {'intent_info': intent_info, 'docs': docs, 'metadatas': metas}

# ==========================================
# 🤖 SECTION 4: GENERATOR (LLM API)
# ==========================================

SYSTEM_PROMPT = """คุณคือ "พี่เกษตร" ผู้ช่วย AI ผู้เชี่ยวชาญด้านการเกษตรของประเทศไทย คอยให้คำปรึกษาและตอบคำถามเกี่ยวกับพืชเศรษฐกิจ 14 ชนิด

กฎเหล็กในการตอบคำถาม (ต้องปฏิบัติตามอย่างเคร่งครัด):
1. การแทนตัว: ให้แทนตัวเองว่า "พี่เกษตร" เท่านั้น ห้ามใช้คำว่า "น้อง" นำหน้าประโยคหรือขึ้นต้นคำตอบเด็ดขาด จะใช้คำว่า "น้อง" หรือ "คุณ" ได้เฉพาะเมื่อต้องการอ้างถึงผู้ใช้ภายในประโยคเท่านั้น เช่น "ถ้าน้องอยากปลูกที่..." ไม่ใช่ขึ้นต้นว่า "น้องครับ..."
2. ห้ามมั่วข้อมูล (No Hallucination): ให้ตอบคำถามโดยใช้ข้อมูลจาก "ข้อมูลอ้างอิง" ที่แนบมาให้เท่านั้น ห้ามเดาเนื้อหาขึ้นเองเด็ดขาด
3. กรณีข้อมูลไม่พอ: หากในข้อมูลอ้างอิงไม่มีคำตอบที่ตรงกับคำถาม ให้ตอบอย่างสุภาพว่า "ขออภัยครับ พี่เกษตรตรวจสอบแล้วยังไม่มีข้อมูลในส่วนนี้นะครับ"
4. ต้องตอบเป็นภาษาไทยเท่านั้น: ห้ามมีภาษาอื่นนอกจากภาษาไทยเข้ามาปะป่นแม้แต่นิดเดียวโดยเด็ดขาด และต้องใช้คำศัพท์ที่คนไทยทั่วไปเข้าใจได้ง่าย ไม่ใช้ศัพท์เทคนิคที่ซับซ้อนเกินไป
5. กฎการตอบ "ข้อมูลพื้นที่เหมาะสม": หากมีการถามเรื่องที่ดินปลูก ต้องระบุ "ชื่อจังหวัด", "ชื่ออำเภอ" (หากมี) และจำนวน "พื้นที่ (ไร่)" ให้ครบถ้วนและถูกต้องตามตัวเลขที่ให้มา
6. กฎการตอบ "คู่มือการปลูกและดูแลพืช": หากถามเกี่ยวกับวิธีการปลูก, การรดน้ำ, หรือการใส่ปุ๋ย ให้สรุปขั้นตอนออกมาเป็นข้อๆ เรียงลำดับให้เข้าใจง่าย อธิบายปริมาณหรือระยะเวลาให้ชัดเจน
7. กฎการตอบ "ศัตรูพืชและโรค": หากถามเกี่ยวกับโรคหรือแมลง ต้องสรุปประเด็นให้ครบคือ:
   - ชื่อโรค/แมลง
   - ระยะการเจริญเติบโตที่เกิดปัญหา
   - ส่วนของพืชที่ถูกทำลาย
   - อาการที่พบ
8. รูปแบบการนำเสนอ: ขึ้นต้นคำตอบด้วยเนื้อหาโดยตรง ไม่ต้องทักทายหรือเกริ่นนำ ตอบให้กระชับ ไม่เยิ่นเย้อ ใช้การขึ้นบรรทัดใหม่ และใช้ Bullet points (-) เสมอเมื่อมีการไล่ลำดับข้อมูล เพื่อให้อ่านง่ายและเป็นมืออาชีพ
9. หากผู้ใช้ถามคำถามที่ไม่เกี่ยวข้องกับการเกษตรหรืออยู่นอกเหนือขอบเขตของข้อมูลอ้างอิง ให้ตอบว่า "ขออภัยครับ พี่เกษตรเชี่ยวชาญเฉพาะเรื่องการเกษตรเท่านั้นนะครับ ถ้ามีคำถามเกี่ยวกับการเกษตรยินดีให้คำปรึกษาเต็มที่เลยครับ" และไม่ต้องเชื่อมโยงข้อมูลอ้างอิงใดๆ ในการตอบคำถามเหล่านั้น
"""

OFF_TOPIC_FALLBACK = "ขออภัยครับ พี่เกษตรเชี่ยวชาญเฉพาะด้านการเกษตรนะครับ ลองถามเรื่องพืช ดิน หรือศัตรูพืชได้เลยครับ 🌾"

def call_llm(system: str, prompt: str, temperature: float, timeout: int) -> str:
    """เรียก LLM ผ่าน /chat/completions — โยน exception ถ้าเรียกไม่สำเร็จ"""
    headers = {'Authorization': f'Bearer {LLM_API_KEY}'} if LLM_API_KEY else {}
    response = requests.post(f'{LLM_BASE_URL}/chat/completions', headers=headers, json={
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user",   "content": prompt},
        ],
        "temperature": temperature,
        "max_tokens": 1024,
    }, timeout=timeout)
    response.raise_for_status()
    return response.json()['choices'][0]['message']['content'].strip()

def generate_answer(question: str, context_docs: list, temperature: float = 0.3) -> str:
    context_text = ''
    for i, doc in enumerate(context_docs, 1):
        context_text += f'[{i}] {doc}\n\n'

    prompt = f"ข้อมูลอ้างอิง:\n{context_text}\nคำถาม: {question}"

    try:
        return call_llm(SYSTEM_PROMPT, prompt, temperature, timeout=120)
    except requests.exceptions.Timeout:
        # ดักจับกรณีที่ LLM ตอบกลับช้ากว่าเวลาที่กำหนด
        return "❌ ขออภัยครับ พี่เกษตรประมวลผลนานเกินไป (Timeout) กรุณาลองถามใหม่อีกครั้งนะครับ"
    except requests.exceptions.HTTPError as e:
        print(f'❌ LLM API error: {e.response.status_code} {e.response.text[:300]}')
        if e.response.status_code == 429:
            return "❌ ขออภัยครับ ตอนนี้มีคนถามเยอะเกินโควตา กรุณารอสักครู่แล้วลองใหม่นะครับ"
        return f"❌ เกิดข้อผิดพลาดจาก LLM API: {e.response.status_code}"
    except requests.exceptions.ConnectionError:
        return "❌ ไม่สามารถเชื่อมต่อ LLM API ได้ กรุณาลองใหม่อีกครั้งนะครับ"

def generate_off_topic_answer(question: str) -> str:
    try:
        # temperature สูงกว่า RAG ปกติ ให้ตอบยืดหยุ่นกว่า
        return call_llm(OFF_TOPIC_SYSTEM_PROMPT, f"คำถามของผู้ใช้: {question}", 0.7, timeout=60)
    except Exception:
        return OFF_TOPIC_FALLBACK

class QueryRequest(BaseModel):
    question: str

@app.get("/")
async def root_hello():
    return {"message": "✅ RAG API is Online! Please send POST request to /ask"}

# ใช้ def ธรรมดา (ไม่ใช่ async) เพราะข้างในมีงานที่บล็อก (encode / requests)
# FastAPI จะรันใน threadpool ให้ — ไม่งั้นทุก request ต้องต่อคิวกัน
@app.post("/ask")
def api_ask(req: QueryRequest, x_api_key: str = Header(default='')):
    if RAG_API_KEY and not secrets.compare_digest(x_api_key, RAG_API_KEY):
        return JSONResponse(status_code=401, content={"error": "invalid API key"})
    try:
        # 🚦 ตรวจสอบว่าคำถามเกี่ยวกับเกษตรไหม — ถ้าไม่ใช่ ปฏิเสธทันทีโดยไม่เรียก LLM
        if not is_agriculture_related(req.question):
            return {
                "answer": generate_off_topic_answer(req.question),
                "intent": "general",
                "crop_name": None,
                "province": None,
                "amphoe": None,
                "sources": [],
                "docs_used": 0
            }

        retrieved = retrieve(req.question, n_results=5)
        intent_info = retrieved['intent_info']
        
        answer = generate_answer(req.question, retrieved['docs'])

        # ประเภทข้อมูลที่ใช้ตอบจริง (ไม่ซ้ำ เรียงตามลำดับที่เจอ)
        sources = list(dict.fromkeys(
            m['data_type'] for m in retrieved['metadatas'] if m.get('data_type')
        ))

        return {
            "answer": answer,
            "intent": intent_info['intent'],
            "crop_name": intent_info['crop_name'],
            "province": intent_info['province'],
            "amphoe": intent_info['amphoe'],
            "sources": sources,
            "docs_used": len(retrieved['docs'])
        }
    except Exception as e:
        # ต้องตอบเป็น HTTP 500 ไม่ใช่ 200 — backend จะได้รู้ว่าพัง
        print(f'❌ /ask error: {e}')
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == '__main__':
    # รันที่ 0.0.0.0 เพื่อให้เข้าจากนอกเครื่องได้ (Hugging Face Spaces ตั้ง PORT=7860)
    # ส่ง app ตรงๆ (ไม่ใช้ reload) — ไม่งั้นโมเดล embedding จะถูกโหลดซ้ำ 2 รอบ
    # ถ้าอยากได้ auto-reload ตอนแก้โค้ด: uvicorn rag_prototype:app --reload
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('PORT', '8000')))