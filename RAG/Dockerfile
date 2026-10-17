# RAG API สำหรับ Hugging Face Spaces (Docker SDK)
FROM python:3.11-slim

# Spaces รัน container ด้วย user id 1000
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    HF_HOME=/home/user/.cache/huggingface \
    PORT=7860
WORKDIR /home/user/app

# ใช้ torch แบบ CPU (เล็กกว่าแบบ CUDA หลาย GB)
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user torch --index-url https://download.pytorch.org/whl/cpu \
 && pip install --no-cache-dir --user -r requirements.txt

# โหลดโมเดล embedding ไว้ใน image เลย จะได้ไม่ต้องโหลด 2GB ทุกครั้งที่ Space ตื่น
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-m3')"

# chroma_db/ ถูกสร้างไว้แล้วใน GitHub Actions แล้วอัปโหลดมาพร้อมโค้ด
COPY --chown=user . .

EXPOSE 7860
CMD ["python", "rag_prototype.py"]
