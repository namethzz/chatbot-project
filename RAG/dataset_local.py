# -*- coding: utf-8 -*-
import os
import json
import pandas as pd

# ---------------------------------------------------------
# 1. กำหนดโฟลเดอร์ที่เก็บไฟล์ 
# ---------------------------------------------------------
output_dir = './data/cleaned/'
os.makedirs(output_dir, exist_ok=True)

if os.path.exists('./RawData'):
    base_dir = './RawData'
else:
    base_dir = './'

print(f"🔍 กำลังค้นหาไฟล์ CSV แบบเจาะลึกทุกโฟลเดอร์ย่อยใน: {os.path.abspath(base_dir)}")

all_data = []

KNOWN_CROPS = [
    'ข้าวโพด', 'มันสำปะหลัง', 'อ้อย', 'สับปะรด', 'ยางพารา', 
    'ทุเรียน', 'มังคุด', 'ลำไย', 'ปาล์มน้ำมัน', 'มะพร้าว', 
    'กาแฟโรบัสต้า', 'กาแฟอาราบิก้า', 'กาแฟ', 'เงาะ', 'ข้าว'
] 

# 2. วนลูปหาไฟล์ .csv ทะลุทุกโฟลเดอร์ย่อยด้วย os.walk
csv_file_paths = []
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.csv'):
            csv_file_paths.append(os.path.join(root, file))

if len(csv_file_paths) == 0:
    print("❌ ไม่พบไฟล์ .csv ในโฟลเดอร์นี้หรือโฟลเดอร์ย่อยเลย")
else:
    print(f"📂 พบไฟล์ .csv ทั้งหมด {len(csv_file_paths)} ไฟล์ กำลังเริ่มอ่านข้อมูล...")
    
    for file_path in csv_file_paths:
        filename = os.path.basename(file_path) # ดึงเฉพาะชื่อไฟล์มาใช้งาน
        
        if 'ความเหมาะสม' in filename or 'เพาะปลูก' in filename:
            try:
                # อ่านไฟล์
                df = pd.read_csv(file_path, skiprows=4, encoding='utf-8-sig')
                df.columns = df.columns.str.strip()
                
                # --- ดึงข้อมูลจากชื่อไฟล์ ---
                name_no_ext = filename.replace('.csv', '')
                level = 'อำเภอ' if '_อำเภอ' in name_no_ext else 'จังหวัด'
                clean_name = name_no_ext.replace('_อำเภอ', '')
                
                # หาชื่อพืช
                crop = "ไม่ระบุ"
                for c in KNOWN_CROPS:
                    if c in clean_name:
                        crop = c
                        break
                        
                # หาชื่อจังหวัด
                prov = "ไม่ระบุ"
                parts = clean_name.split('_')
                if len(parts) >= 2:
                    prov = parts[1]

                df['ชนิดพืช'] = crop
                df['จังหวัด'] = prov
                df['ระดับข้อมูล'] = level
                
                # --- ปรับมาตรฐานคอลัมน์ ---
                if 'เนื้อที่ (ไร่)' in df.columns:
                    df.rename(columns={'เนื้อที่ (ไร่)': 'พื้นที่ (ไร่)'}, inplace=True)
                    
                if 'ประเภท' not in df.columns:
                    df['ประเภท'] = 'พื้นที่เพาะปลูกรวม' 
                    
                keep_cols = ['ชนิดพืช', 'จังหวัด', 'ขอบเขต', 'ประเภท', 'พื้นที่ (ไร่)', 'ระดับข้อมูล']
                df = df[[c for c in keep_cols if c in df.columns]]
                
                df = df.dropna(subset=['พื้นที่ (ไร่)'])
                df = df[df['ขอบเขต'] != 'แหล่งข้อมูล']
                
                all_data.append(df)
                print(f"  ✅ อ่านสำเร็จ: {filename} -> พืช: {crop}, จังหวัด: {prov}, ระดับ: {level}")
                
            except Exception as e:
                print(f"  ❌ ผิดพลาดที่ไฟล์ {filename}: {e}")
        else:
            print(f"  ⚠️ ข้ามไฟล์: {filename} (ชื่อไฟล์ไม่มีคีย์เวิร์ดเป้าหมาย)")

# 3. นำข้อมูลจากทุกไฟล์มารวมกันและสร้าง RAG
if all_data:
    final_df = pd.concat(all_data, ignore_index=True)
    rag_docs = []
    
    print("\n⚙️ กำลังแปลงข้อมูลเป็นข้อความเพื่อทำ RAG...")
    for idx, row in final_df.iterrows():
        crop = row['ชนิดพืช']
        prov = row['จังหวัด']
        boundary = row['ขอบเขต']
        area_type = row['ประเภท']
        area = row['พื้นที่ (ไร่)']
        level = row['ระดับข้อมูล']
        
        if level == 'อำเภอ':
            loc_name = boundary.replace('อ.', 'อำเภอ') if boundary.startswith('อ.') else f"อำเภอ{boundary}"
            loc_str = f"{loc_name} จังหวัด{prov}"
            doc_id = f"land_{crop}_{prov}_{boundary}_{idx}"
            amphoe_meta = boundary
        else:
            loc_str = f"จังหวัด{prov} (ภาพรวมทั้งจังหวัด)"
            doc_id = f"land_{crop}_{prov}_{idx}"
            amphoe_meta = ""
            
        rag_text = f"ข้อมูลพื้นที่: {crop} ใน{loc_str} พบว่าเป็น {area_type} จำนวน {area:,.2f} ไร่"
        
        doc = {
            "id": doc_id,
            "text": rag_text,
            "metadata": {
                "crop_name": crop,
                "province": prov,
                "amphoe": amphoe_meta,
                "level": level
            }
        }
        rag_docs.append(doc)

    # 4. EXPORT ไฟล์
    csv_out = os.path.join(output_dir, 'combined_land_data.csv')
    json_out = os.path.join(output_dir, 'combined_land_data.json')
    final_df.to_csv(csv_out, index=False, encoding='utf-8-sig')
    final_df.to_json(json_out, orient='records', force_ascii=False, indent=4)
    
    rag_out = os.path.join(output_dir, 'land_suit_rag_full.jsonl')
    with open(rag_out, 'w', encoding='utf-8') as f:
        for doc in rag_docs:
            f.write(json.dumps(doc, ensure_ascii=False) + '\n')
            
    print(f"\n🎉 ประมวลผลเสร็จสิ้น! ได้เอกสารสำหรับ RAG ทั้งหมด {len(rag_docs)} รายการ")
    print(f"บันทึกไฟล์ไว้ที่: {output_dir}")
else:
    print("\n❌ ไม่สามารถสร้างไฟล์ RAG ได้ เนื่องจากไม่พบข้อมูลที่ถูกต้องในการประมวลผล")