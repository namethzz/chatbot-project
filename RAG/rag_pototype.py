# -*- coding: utf-8 -*-
import os
import json
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer
import requests  
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# ==========================================
# ⚙️ SECTION 1: SETUP PATH & APP
# ==========================================

# กำหนด Path เป็นโฟลเดอร์ในเครื่อง (Local)
DATA_DIR = './data/cleaned/'
DB_DIR   = './chroma_db/'

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

# สร้าง FastAPI App
app = FastAPI()

# เปิด CORS เพื่อให้ Frontend (เช่น React/Next.js) เรียก API ได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 📦 SECTION 2: VECTOR DB & EMBEDDING
# ==========================================

print('กำลังโหลด Embedding model (MiniLM)...')
embed_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# เชื่อมต่อ ChromaDB แบบ Persistent (บันทึกลงฮาร์ดดิสก์)
chroma_client = chromadb.PersistentClient(path=DB_DIR)

# ใช้ get_or_create เพื่อที่จะไม่ต้องสร้างใหม่ทุกครั้งที่รัน Server
collection = chroma_client.get_or_create_collection(
    name='crops_rag',
    metadata={'hnsw:space': 'cosine'}
)
print('✅ ChromaDB collection พร้อมใช้งาน:', collection.name)

# ---------------------------------------------------------
# ⚠️ โซนโหลดข้อมูล: 
# ถ้าคุณยังไม่เคยเอาข้อมูลเข้า ChromaDB ในเครื่อง ให้ Uncomment 
# ฟังก์ชันด้านล่างนี้ และรัน 1 ครั้ง เมื่อข้อมูลเข้า DB แล้ว ให้ Comment กลับครับ
# ---------------------------------------------------------
BATCH_SIZE = 64
def load_jsonl_to_chroma(jsonl_path, data_type_override=None):
    if not os.path.exists(jsonl_path):
        print(f"⚠️ ไม่พบไฟล์ {jsonl_path} ข้ามการโหลด...")
        return
        
    with open(jsonl_path, encoding='utf-8') as f:
        docs = [json.loads(line) for line in f]

    total = len(docs)
    print(f'กำลังโหลด {total} docs จาก {os.path.basename(jsonl_path)}')

    for start in range(0, total, BATCH_SIZE):
        batch = docs[start:start + BATCH_SIZE]
        ids       = [d['id'] for d in batch]
        texts     = [d['text'] for d in batch]
        metadatas = []

        for d in batch:
            meta = {k: str(v) for k, v in d['metadata'].items()}
            if data_type_override:
                meta['data_type'] = data_type_override
            metadatas.append(meta)

        embeddings = embed_model.encode(texts, show_progress_bar=False).tolist()

        collection.upsert(
            ids=ids, documents=texts, metadatas=metadatas, embeddings=embeddings
        )
    print(f'✅ โหลดเสร็จสิ้น\n')

# Uncomment 3 บรรทัดนี้ หากต้องการนำเข้าข้อมูลใหม่ (ต้องมีไฟล์ใน ./data/cleaned/ ก่อน)
# load_jsonl_to_chroma(DATA_DIR + 'land_suit_rag.jsonl',    data_type_override='land_suitability')
# load_jsonl_to_chroma(DATA_DIR + 'growing_guide_rag.jsonl', data_type_override='growing_guide')
# load_jsonl_to_chroma(DATA_DIR + 'pest_rag.jsonl',          data_type_override='pest_info')

# ==========================================
# 🔍 SECTION 3: RETRIEVER
# ==========================================

CROP_NAMES = [
    'ข้าว', 'ข้าวโพด', 'มันสำปะหลัง', 'อ้อย', 'สับปะรด', 'ยางพารา',
    'ทุเรียน', 'มังคุด', 'ลำไย', 'ปาล์มน้ำมัน', 'มะพร้าว',
    'กาแฟโรบัสต้า', 'กาแฟอาราบิก้า', 'กาแฟ', 'เงาะ'
]

LAND_KEYWORDS  = ['เหมาะสม', 'ปลูกได้', 'ที่ดิน', 'พื้นที่', 'จังหวัด', 'ภาค', 'ไร่', 'แถว', 'ที่ไหน', 'อยู่ที่', 'ปลูกที่']
GUIDE_KEYWORDS = ['ปลูกยังไง', 'วิธีปลูก', 'การปลูก', 'ปุ๋ย', 'รดน้ำ', 'ดูแล', 'เก็บเกี่ยว', 'ระยะ', 'ดิน', 'อุณหภูมิ', 'ฝน', 'ผลผลิต', 'พันธุ์', 'ปลูกช่วงไหน', 'กี่วัน', 'กี่เดือน']
PEST_KEYWORDS  = ['โรค', 'แมลง', 'ศัตรู', 'อาการ', 'ทำลาย', 'ระบาด', 'เชื้อ', 'รักษา', 'ป้องกัน', 'หนอน', 'เพลี้ย', 'ไร', 'เน่า', 'ใบไหม้', 'ใบจุด', 'เหี่ยว']

ALL_PROVINCES = [
    'กระบี่','กรุงเทพมหานคร','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ',
    'ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์',
    'นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา',
    'พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน',
    'ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล',
    'สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์',
    'หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี'
]

def parse_intent(question: str) -> dict:
    q = question.lower()
    crop_found = None
    for crop in CROP_NAMES:
        if crop in question:
            crop_found = crop
            if crop == 'กาแฟ' and 'อาราบิก้า' in question: crop_found = 'กาแฟอาราบิก้า'
            elif crop == 'กาแฟ' and 'โรบัสต้า' in question: crop_found = 'กาแฟโรบัสต้า'
            break

    province_found = None
    for prov in ALL_PROVINCES:
        if prov in question:
            province_found = prov
            break

    land_score  = sum(1 for kw in LAND_KEYWORDS  if kw in question)
    guide_score = sum(1 for kw in GUIDE_KEYWORDS if kw in question)
    pest_score  = sum(1 for kw in PEST_KEYWORDS  if kw in question)

    if province_found: land_score += 3
    max_score = max(land_score, guide_score, pest_score)

    if max_score == 0 or (land_score == guide_score == pest_score):
        intent, data_types = 'general', ['land_suitability', 'growing_guide', 'pest_info']
    elif land_score >= guide_score and land_score >= pest_score:
        intent, data_types = 'land', ['land_suitability']
    elif guide_score >= pest_score:
        intent, data_types = 'guide', ['growing_guide']
    else:
        intent, data_types = 'pest', ['pest_info']

    return {'crop_name': crop_found, 'province': province_found, 'intent': intent, 'data_types': data_types}

def retrieve(question: str, n_results: int = 5) -> dict:
    intent_info = parse_intent(question)
    crop, prov, dtypes, intent = intent_info['crop_name'], intent_info['province'], intent_info['data_types'], intent_info['intent']

    where_conditions = []
    if crop: where_conditions.append({'crop_name': {'$eq': crop}})
    if intent != 'general' and len(dtypes) == 1: where_conditions.append({'data_type': {'$eq': dtypes[0]}})
    if prov and intent == 'land': where_conditions.append({'province': {'$eq': prov}})

    where = None
    if len(where_conditions) == 1: where = where_conditions[0]
    elif len(where_conditions) > 1: where = {'$and': where_conditions}

    query_embedding = embed_model.encode([question]).tolist()

    try:
        results = collection.query(query_embeddings=query_embedding, n_results=min(n_results, collection.count()), where=where, include=['documents', 'metadatas'])
        docs, metas = results['documents'][0], results['metadatas'][0]
    except Exception as e:
        results = collection.query(query_embeddings=query_embedding, n_results=min(n_results, collection.count()), include=['documents', 'metadatas'])
        docs, metas = results['documents'][0], results['metadatas'][0]

    return {'intent_info': intent_info, 'docs': docs, 'metadatas': metas}

# ==========================================
# 🤖 SECTION 4: GENERATOR (OLLAMA API)
# ==========================================

SYSTEM_PROMPT = """คุณเป็นผู้เชี่ยวชาญด้านการเกษตรของประเทศไทย มีความรู้เกี่ยวกับพืชเศรษฐกิจ 14 ชนิด ได้แก่ ข้าว ข้าวโพด มันสำปะหลัง อ้อย สับปะรด ยางพารา ทุเรียน มังคุด ลำไย ปาล์มน้ำมัน มะพร้าว กาแฟโรบัสต้า กาแฟอาราบิก้า และเงาะ

กฎการตอบ:
1. ตอบเฉพาะข้อมูลที่มีใน context ที่ให้มาเท่านั้น
2. ถ้า context ไม่มีข้อมูลที่ถามหา ให้ตอบตรงๆ ว่า "ไม่มีข้อมูลในส่วนนี้"
3. ตอบเป็นภาษาไทยที่เข้าใจง่าย กระชับ และตรงประเด็น
4. ถ้ามีข้อมูลพื้นที่จังหวัด ให้ระบุตัวเลขไร่ด้วย
5. ถ้าถามเรื่องความเหมาะสมที่ดิน ให้บอกทั้ง 'เหมาะสมสูง' และ 'เหมาะสมปานกลาง'
6. ห้ามแต่งข้อมูลที่ไม่มีใน context"""

def generate_answer(question: str, context_docs: list, temperature: float = 0.3) -> str:
    """ส่งคำถามและบริบทไปให้ Qwen2 ที่รันอยู่บน Ollama"""
    context_text = ''
    for i, doc in enumerate(context_docs, 1):
        context_text += f'[{i}] {doc}\n\n'

    prompt = f"ข้อมูลอ้างอิง:\n{context_text}\nคำถาม: {question}"

    try:
        # ยิง Request ไปที่ Ollama API บนเครื่อง Local
        response = requests.post('http://localhost:11434/api/generate', json={
            "model": "qwen2.5:7b",
            "system": SYSTEM_PROMPT,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        })
        
        if response.status_code == 200:
            return response.json()['response'].strip()
        else:
            return f"❌ เกิดข้อผิดพลาดจาก Ollama: {response.status_code}"
            
    except requests.exceptions.ConnectionError:
        return "❌ ไม่สามารถเชื่อมต่อ Ollama ได้ กรุณาตรวจสอบว่าคุณรันคำสั่ง 'ollama run qwen2' แล้ว"

# ==========================================
# 💬 SECTION 5: FASTAPI ENDPOINTS
# ==========================================

class QueryRequest(BaseModel):
    question: str

@app.post("/ask")
async def api_ask(req: QueryRequest):
    try:
        # 1. ค้นหาข้อมูล (Retrieve)
        retrieved = retrieve(req.question, n_results=5)
        intent_info = retrieved['intent_info']
        
        # 2. สร้างคำตอบ (Generate)
        answer = generate_answer(req.question, retrieved['docs'])
        
        # ส่งค่ากลับไปให้ Frontend ตรงกับโครงสร้างที่กำหนดไว้
        return {
            "answer": answer,
            "intent": intent_info['intent'],
            "crop_name": intent_info['crop_name'],
            "province": intent_info['province'],
            "sources": [], 
            "docs_used": len(retrieved['docs'])
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # รัน Server ที่พอร์ต 8000
    uvicorn.run("rag_pototype:app", host="0.0.0.0", port=8000, reload=True)