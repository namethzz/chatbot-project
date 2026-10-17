---
title: Agri RAG API
emoji: 🌾
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# RAG API — พี่เกษตร

โฟลเดอร์นี้ถูก deploy ขึ้น Hugging Face Spaces อัตโนมัติด้วย `.github/workflows/deploy-rag.yml`
(ส่วนหัว YAML ด้านบนเป็นค่าตั้งของ Space — อย่าลบ)

- `POST /ask` `{ "question": "..." }` → คำตอบ + intent + sources
- `GET /` → health check

ดูวิธีรันและตั้งค่าทั้งหมดที่ [README หลัก](../README.md)
