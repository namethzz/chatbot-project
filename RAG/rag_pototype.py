# -*- coding: utf-8 -*-
import os
import json
import re
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

DATA_DIR = './data/cleaned/'
DB_DIR   = './chroma_db/'

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

app = FastAPI()

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

print('กำลังโหลด Embedding model (BAAI/bge-m3)...')
embed_model = SentenceTransformer('BAAI/bge-m3')

chroma_client = chromadb.PersistentClient(path=DB_DIR)
collection = chroma_client.get_or_create_collection(name="agri_knowledge_v2")

BATCH_SIZE = 2000 

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
        ids       = [str(d['id']) for d in batch]
        
        texts     = [d['text'].replace('เเ', 'แ') for d in batch]
        metadatas = []

        for d in batch:
            meta = {k: str(v).replace('เเ', 'แ') for k, v in d['metadata'].items()}
            if data_type_override:
                meta['data_type'] = data_type_override
            metadatas.append(meta)

        embeddings = embed_model.encode(texts, show_progress_bar=True).tolist()

        collection.upsert(
            ids=ids, documents=texts, metadatas=metadatas, embeddings=embeddings
        )
    print(f'✅ โหลดเสร็จสิ้น\n')

# ---------------------------------------------------------
# 💡 ปลดคอมเมนต์บรรทัดด้านล่างเพื่อโหลดข้อมูลใหม่
# ---------------------------------------------------------
# load_jsonl_to_chroma(DATA_DIR + 'land_suit_rag_full.jsonl', data_type_override='land_suitability')
# load_jsonl_to_chroma(DATA_DIR + 'plant_growing_rag_ready.jsonl', data_type_override='growing_guide')

# 🌟 โหลดข้อมูลศัตรูพืช (Pest) - ปลดคอมเมนต์บรรทัดนี้ในครั้งแรกที่รัน!
# load_jsonl_to_chroma(DATA_DIR + 'pest_rag.jsonl', data_type_override='pest_info')

# ==========================================
# 🔍 SECTION 3: RETRIEVER
# ==========================================

CROP_NAMES = [
    'ข้าว', 'ข้าวโพด', 'มันสำปะหลัง', 'อ้อย', 'สับปะรด', 'ยางพารา',
    'ทุเรียน', 'มังคุด', 'ลำไย', 'ปาล์มน้ำมัน', 'มะพร้าว',
    'กาแฟโรบัสต้า', 'กาแฟอาราบิก้า', 'กาแฟ', 'เงาะ'
]

LAND_KEYWORDS  = ['เหมาะสม', 'ปลูกได้', 'ที่ดิน', 'พื้นที่', 'จังหวัด', 'อำเภอ', 'ภาค', 'ไร่', 'แถว', 'ที่ไหน', 'อยู่ที่', 'ปลูกที่']
GUIDE_KEYWORDS = ['ปลูกยังไง', 'วิธีปลูก', 'การปลูก', 'ปุ๋ย', 'รดน้ำ', 'ดูแล', 'เก็บเกี่ยว', 'ระยะ', 'ดิน', 'อุณหภูมิ', 'ฝน', 'ผลผลิต', 'พันธุ์', 'กี่วัน']
PEST_KEYWORDS  = ['โรค', 'แมลง', 'ศัตรู', 'อาการ', 'ทำลาย', 'ระบาด', 'เชื้อ', 'รักษา', 'ป้องกัน', 'หนอน', 'เพลี้ย', 'ไร', 'เน่า', 'ใบไหม้', 'ใบจุด', 'เหี่ยว', 'ตาย']

ALL_PROVINCES = [
    'กระบี่','กรุงเทพมหานคร','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ',
    'ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์',
    'นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา',
    'พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน',
    'ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล',
    'สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์',
    'หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี'
]

# ==========================================
# 🚦 SECTION 2.5: TOPIC GUARD
# ==========================================

AGRI_KEYWORDS = (
    CROP_NAMES
    + LAND_KEYWORDS
    + GUIDE_KEYWORDS
    + PEST_KEYWORDS
    + ALL_PROVINCES
    + [
        'เกษตร', 'ชาวนา', 'ชาวสวน', 'ชาวไร่', 'ฟาร์ม', 'นา', 'สวน', 'ไร่',
        'พืช', 'ต้นไม้', 'เมล็ด', 'กล้า', 'ต้นกล้า', 'หัว', 'ราก', 'ลำต้น',
        'ใบ', 'ดอก', 'ผล', 'เก็บเกี่ยว', 'ฤดูกาล', 'น้ำ', 'ชลประทาน',
        'สารเคมี', 'ยาฆ่าแมลง', 'สารกำจัดศัตรูพืช', 'ปุ๋ยเคมี', 'ปุ๋ยอินทรีย์',
        'พันธุ์', 'ไถ', 'หว่าน', 'ตัดแต่ง', 'แปลง', 'ดิน', 'อินทรีย์',
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
    q = question.replace('เเ', 'แ').lower()
    return any(kw.lower() in q for kw in AGRI_KEYWORDS)


def parse_intent(question: str) -> dict:
    q = question.replace('เเ', 'แ').lower()
    
    crop_found = None
    for crop in CROP_NAMES:
        if crop in q:
            crop_found = crop
            if crop == 'กาแฟ' and 'อาราบิก้า' in q: crop_found = 'กาแฟอาราบิก้า'
            elif crop == 'กาแฟ' and 'โรบัสต้า' in q: crop_found = 'กาแฟโรบัสต้า'
            break

    province_found = None
    for prov in ALL_PROVINCES:
        if prov in q:
            province_found = prov
            break

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
    max_score = max(land_score, guide_score, pest_score)

    if max_score == 0 or (land_score == guide_score == pest_score):
        intent, data_types = 'general', ['land_suitability', 'growing_guide', 'pest_info']
    elif land_score >= guide_score and land_score >= pest_score:
        intent, data_types = 'land', ['land_suitability']
    elif pest_score >= guide_score:
        intent, data_types = 'pest', ['pest_info']
    else:
        intent, data_types = 'guide', ['growing_guide']

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

    where_conditions = []
    
    # 1. บังคับหาชนิดพืช
    if crop: 
        where_conditions.append({'crop_name': {'$eq': crop}})
        
    # 2. บังคับจังหวัดเฉพาะเรื่องที่ดิน
    if prov and intent == 'land': 
        where_conditions.append({'province': {'$eq': prov}})
        
    # 3. ถ้าถามเรื่องแมลง/โรค ให้ดึงจากทั้งไฟล์ Pest และไฟล์ Guide (เผื่อมีข้อมูลซ้อนกัน)
    if intent == 'pest': 
        where_conditions.append({'data_type': {'$in': ['pest_info', 'growing_guide']}})
    elif intent == 'guide':
        where_conditions.append({'data_type': {'$eq': 'growing_guide'}})
    elif intent == 'land':
        where_conditions.append({'data_type': {'$eq': 'land_suitability'}})

    where = None
    if len(where_conditions) == 1: where = where_conditions[0]
    elif len(where_conditions) > 1: where = {'$and': where_conditions}

    query_embedding = embed_model.encode([question]).tolist()

    try:
        results = collection.query(
            query_embeddings=query_embedding, 
            n_results=min(n_results, collection.count()), 
            where=where, 
            include=['documents', 'metadatas']
        )
        docs, metas = results['documents'][0], results['metadatas'][0]
    except Exception as e:
        results = collection.query(
            query_embeddings=query_embedding, 
            n_results=min(n_results, collection.count()), 
            include=['documents', 'metadatas']
        )
        docs, metas = results['documents'][0], results['metadatas'][0]

    return {'intent_info': intent_info, 'docs': docs, 'metadatas': metas}

# ==========================================
# 🤖 SECTION 4: GENERATOR (OLLAMA API)
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

def generate_answer(question: str, context_docs: list, temperature: float = 0.3) -> str:
    context_text = ''
    for i, doc in enumerate(context_docs, 1):
        context_text += f'[{i}] {doc}\n\n'

    prompt = f"ข้อมูลอ้างอิง:\n{context_text}\nคำถาม: {question}"

    try:
        response = requests.post('http://localhost:11434/api/generate', json={
            "model": "qwen2.5:7b",
            "system": SYSTEM_PROMPT,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature}
        }, timeout=120)  # <--- เติม , timeout=60 ไว้ตรงนี้ครับ
        
        if response.status_code == 200:
            return response.json()['response'].strip()
        else:
            return f"❌ เกิดข้อผิดพลาดจาก Ollama: {response.status_code}"
            
    except requests.exceptions.Timeout:
        # ดักจับกรณีที่ Ollama ตอบกลับช้ากว่าเวลาที่กำหนด
        return "❌ ขออภัยครับ พี่เกษตรประมวลผลนานเกินไป (Timeout) กรุณาลองถามใหม่อีกครั้งนะครับ"
    except requests.exceptions.ConnectionError:
        return "❌ ไม่สามารถเชื่อมต่อ Ollama ได้ กรุณาเปิดโปรแกรม Ollama ให้เรียบร้อย"

def generate_off_topic_answer(question: str) -> str:
    try:
        response = requests.post('http://localhost:11434/api/generate', json={
            "model": "qwen2.5:7b",
            "system": OFF_TOPIC_SYSTEM_PROMPT,
            "prompt": f"คำถามของผู้ใช้: {question}",
            "stream": False,
            "options": {"temperature": 0.7}  # ให้ยืดหยุ่นกว่า RAG ปกติ
        }, timeout=60)

        if response.status_code == 200:
            return response.json()['response'].strip()
        else:
            return "ขออภัยครับ พี่เกษตรเชี่ยวชาญเฉพาะด้านการเกษตรนะครับ ลองถามเรื่องพืช ดิน หรือศัตรูพืชได้เลยครับ 🌾"

    except Exception:
        return "ขออภัยครับ พี่เกษตรเชี่ยวชาญเฉพาะด้านการเกษตรนะครับ ลองถามเรื่องพืช ดิน หรือศัตรูพืชได้เลยครับ 🌾"

class QueryRequest(BaseModel):
    question: str

@app.get("/")
async def root_hello():
    return {"message": "✅ RAG API is Online! Please send POST request to /ask"}

@app.post("/ask")
async def api_ask(req: QueryRequest):
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
        
        return {
            "answer": answer,
            "intent": intent_info['intent'],
            "crop_name": intent_info['crop_name'],
            "province": intent_info['province'],
            "amphoe": intent_info['amphoe'],
            "sources": [], 
            "docs_used": len(retrieved['docs'])
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == '__main__':
    # รันที่ 0.0.0.0 เพื่อให้เพื่อนยิงผ่าน ngrok หรือ cloudflared ได้
    uvicorn.run("rag_pototype:app", host="0.0.0.0", port=8000, reload=True)