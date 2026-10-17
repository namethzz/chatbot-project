# -*- coding: utf-8 -*-
# สร้าง Vector DB ใหม่ทั้งหมดจาก data/cleaned → chroma_db/
# ใช้ตอน deploy (GitHub Actions) หรือรันเองในเครื่อง: python build_db.py
from vector_db import rebuild_db, get_collection

if __name__ == '__main__':
    rebuild_db()
    print(f'🎉 Vector DB พร้อมใช้: {get_collection().count()} docs')
