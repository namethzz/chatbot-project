# -*- coding: utf-8 -*-
import os
import re
import json
import pandas as pd
from constants import CROP_NAMES, CROP_NAMES_LONGEST_FIRST, ALL_PROVINCES, normalize_thai

# ---------------------------------------------------------
# 1. กำหนดโฟลเดอร์ที่เก็บไฟล์ (อิงตำแหน่งของสคริปต์ รันจากที่ไหนก็ได้)
# ---------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(SCRIPT_DIR, 'data', 'cleaned')
os.makedirs(output_dir, exist_ok=True)

base_dir = os.path.join(SCRIPT_DIR, 'data', 'RawData')

print(f"🔍 กำลังค้นหาไฟล์ CSV แบบเจาะลึกทุกโฟลเดอร์ย่อยใน: {os.path.abspath(base_dir)}")

all_data = []

# 2. วนลูปหาไฟล์ .csv ทะลุทุกโฟลเดอร์ย่อยด้วย os.walk
csv_file_paths = []
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.csv'):
            csv_file_paths.append(os.path.join(root, file))
csv_file_paths.sort()  # ให้ลำดับ (และ id ของเอกสาร) เหมือนกันทุกเครื่อง

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
                clean_name = name_no_ext.replace('_อำเภอ', '')
                
                path_parts = os.path.normpath(file_path).split(os.sep)

                # หาชื่อพืช: ยึดจากชื่อไฟล์ก่อน (มีไฟล์ที่วางผิดโฟลเดอร์พืช)
                # ถ้าชื่อไฟล์ไม่บอก ค่อยดูจากชื่อโฟลเดอร์
                # (ชื่อไฟล์บางไฟล์สะกด "อราบิก้า" → normalize_thai แก้ให้)
                crop_name_src = normalize_thai(clean_name)
                crop = next((c for c in CROP_NAMES_LONGEST_FIRST if c in crop_name_src), None)
                if crop is None:
                    crop = next((p for p in path_parts if p in CROP_NAMES), "ไม่ระบุ")

                # หาชื่อจังหวัด: ยึดจากชื่อไฟล์ก่อน (มีไฟล์ที่วางผิดโฟลเดอร์จังหวัด เช่น
                # ไฟล์ยโสธรอยู่ในโฟลเดอร์มุกดาหาร) ชื่อไฟล์ใช้ตัวคั่นได้ทั้ง _ และ -
                # ถ้าชื่อไฟล์ไม่มีจังหวัด ค่อยดูจากชื่อโฟลเดอร์
                name_parts = re.split(r'[_-]', clean_name)
                prov = next((p for p in name_parts if p in ALL_PROVINCES), None)
                if prov is None:
                    prov = next((p for p in path_parts if p in ALL_PROVINCES), "ไม่ระบุ")

                df['ชนิดพืช'] = crop
                df['จังหวัด'] = prov
                
                # --- ปรับมาตรฐานคอลัมน์ ---
                if 'เนื้อที่ (ไร่)' in df.columns:
                    df.rename(columns={'เนื้อที่ (ไร่)': 'พื้นที่ (ไร่)'}, inplace=True)
                    
                if 'ประเภท' not in df.columns:
                    df['ประเภท'] = 'พื้นที่เพาะปลูกรวม' 
                    
                keep_cols = ['ชนิดพืช', 'จังหวัด', 'ขอบเขต', 'ประเภท', 'พื้นที่ (ไร่)', 'ระดับข้อมูล']
                df = df[[c for c in keep_cols if c in df.columns]]
                
                df = df.dropna(subset=['พื้นที่ (ไร่)'])
                df = df[df['ขอบเขต'] != 'แหล่งข้อมูล']

                # ระดับข้อมูลดูจากแต่ละแถว ไม่ใช่ชื่อไฟล์ — ไฟล์รายอำเภอหลายไฟล์ไม่มี
                # "_อำเภอ" ในชื่อ และไฟล์รายอำเภอบางไฟล์มีแถวรวมทั้งจังหวัดปนอยู่
                df['ขอบเขต'] = df['ขอบเขต'].astype(str).str.strip()
                df['ระดับข้อมูล'] = (df['ขอบเขต'] == prov).map({True: 'จังหวัด', False: 'อำเภอ'})

                all_data.append(df)
                print(f"  ✅ อ่านสำเร็จ: {filename} -> พืช: {crop}, จังหวัด: {prov}")
                
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
            if boundary.startswith('อ.'):
                loc_name = boundary.replace('อ.', 'อำเภอ', 1)
            elif boundary.startswith(('เขต', 'ต.')):  # เช่น เขตการปกครองพิเศษพัทยา
                loc_name = boundary
            else:
                loc_name = f"อำเภอ{boundary}"
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