# -*- coding: utf-8 -*-
# Vector DB (ChromaDB) + Embedding model — ใช้ทั้งตอนรัน API และตอนสร้าง DB (build_db.py)
import os
import json
import chromadb
from sentence_transformers import SentenceTransformer
from constants import normalize_thai

# อิงตำแหน่งของไฟล์นี้ — รันจากโฟลเดอร์ไหนก็ได้
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(SCRIPT_DIR, 'data', 'cleaned')
DB_DIR     = os.path.join(SCRIPT_DIR, 'chroma_db')

os.makedirs(DB_DIR, exist_ok=True)

print('กำลังโหลด Embedding model (BAAI/bge-m3)...')
embed_model = SentenceTransformer('BAAI/bge-m3')

chroma_client = chromadb.PersistentClient(path=DB_DIR)
COLLECTION_NAME = "agri_knowledge_v2"
collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)

BATCH_SIZE = 2000

DATA_FILES = [
    ('land_suit_rag_full.jsonl',      'land_suitability'),
    ('plant_growing_rag_ready.jsonl', 'growing_guide'),
    ('pest_rag.jsonl',                'pest_info'),
]


def get_collection():
    # rebuild_db() สร้าง collection ใหม่ → ต้องเรียกผ่านฟังก์ชันนี้ ไม่ import ตัวแปรไปตรงๆ
    return collection


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

        texts     = [normalize_thai(d['text']) for d in batch]
        metadatas = []

        for d in batch:
            meta = {k: normalize_thai(str(v)) for k, v in d['metadata'].items()}
            if data_type_override:
                meta['data_type'] = data_type_override
            metadatas.append(meta)

        embeddings = embed_model.encode(texts, show_progress_bar=True).tolist()

        collection.upsert(
            ids=ids, documents=texts, metadatas=metadatas, embeddings=embeddings
        )
    print(f'✅ โหลดเสร็จสิ้น\n')


def rebuild_db():
    """ลบ collection เดิมแล้วโหลดข้อมูลทั้งหมดใหม่ (กันเอกสารเก่าที่ id ไม่ตรงค้างอยู่)"""
    global collection
    chroma_client.delete_collection(COLLECTION_NAME)
    collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
    for filename, data_type in DATA_FILES:
        load_jsonl_to_chroma(os.path.join(DATA_DIR, filename), data_type_override=data_type)
