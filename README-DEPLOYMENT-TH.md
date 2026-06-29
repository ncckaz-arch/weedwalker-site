# WEED WALKER Experience Platform — Vercel + Neon Deployment

เอกสารนี้สำหรับเอา WEED WALKER Experience Platform ขึ้น production แบบเร็วและปลอดภัยก่อน โดยโฟกัสเฉพาะ:

- หน้าแรก `/`
- Intake Portal `/intake`
- Flight Menu `/menu`
- Access Level `/access`

เวอร์ชันแรกยังไม่เปิด Google Login, GCS upload, PDF generation, Member protected access และ Random/Lucky Draw เพื่อไม่ให้ฟีเจอร์ที่ยังไม่จบไปบล็อกการ deploy

---

## Environment variables

### Required for first launch

ต้องใส่ใน Vercel ก่อน deploy:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
SESSION_SECRET="replace-with-32-byte-random-secret"
APP_URL="https://weedwalker.net"
NEXT_PUBLIC_APP_URL="https://weedwalker.net"
```

### First-launch feature flags

ให้ตั้งค่าแบบนี้สำหรับรอบแรก:

```env
ENABLE_FILE_UPLOADS="false"
NEXT_PUBLIC_ENABLE_FILE_UPLOADS="false"
ENABLE_GOOGLE_LOGIN="false"
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN="false"
ENABLE_RANDOM_PROMO="false"
NEXT_PUBLIC_ENABLE_RANDOM_PROMO="false"
APPS_SCRIPT_INTAKE_URL=""
APPS_SCRIPT_FORWARD_REQUIRED="false"
APPS_SCRIPT_FORWARD_FILES="false"
NEXT_PUBLIC_APPS_SCRIPT_FORWARD_FILES="false"
```

ผลลัพธ์:

- Intake ส่งข้อมูลลง Neon Postgres ได้โดยไม่ต้อง login
- Upload เอกสารจะถูกปิดไว้พร้อมข้อความอธิบายชัดเจน
- Google Login และหน้า Member ที่ต้อง login จะถูก bypass อย่างปลอดภัย
- Random/Lucky Draw ไม่ถูกนับเป็น core website
- `/intake` เป็นหน้า WEED WALKER จริงบน `weedwalker.net` และสามารถ forward payload ไป Apps Script หลังบ้านได้เมื่อ Apps Script รองรับ `doPost`

### Optional for later

ค่อยใส่ตอนเปิดฟีเจอร์รอบถัดไป:

```env
GOOGLE_CLIENT_ID=""
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
GCS_BUCKET_NAME=""
GOOGLE_CLOUD_CREDENTIALS_JSON=""
GOOGLE_APPLICATION_CREDENTIALS=""
LINE_GROUP_URL="https://lin.ee/yNXeTBs"
NEXT_PUBLIC_LINE_GROUP_URL="https://lin.ee/yNXeTBs"
```

### เปิด Identity Upload / ID Card / Selfie

กล่อง `Upload disabled for this deployment` จะหายไปเมื่อเปิดไฟล์ upload ใน Vercel ด้วย env ต่อไปนี้:

```env
ENABLE_FILE_UPLOADS="true"
NEXT_PUBLIC_ENABLE_FILE_UPLOADS="true"
GCS_BUCKET_NAME="ชื่อ bucket ใน Google Cloud Storage"
GOOGLE_CLOUD_CREDENTIALS_JSON="service account json หรือ base64 ของ service account json"
MAX_UPLOAD_MB="12"
```

หมายเหตุ:

- Neon Postgres เก็บข้อมูลฟอร์มและ metadata ของไฟล์
- Google Cloud Storage เก็บไฟล์จริง เช่น ID card, selfie, medical document
- ใน Vercel ให้ใช้ `GOOGLE_CLOUD_CREDENTIALS_JSON` แทนการอัปโหลดไฟล์ credential path
- หลังเพิ่ม/แก้ env ต้อง Redeploy ใหม่ 1 รอบ

### Apps Script backend adapter

Level 4 setup:

- ลูกค้าเห็นและใช้งาน `/intake` บน `weedwalker.net`
- Next.js API รับข้อมูลที่ `/api/intake`
- ระบบบันทึกลง Neon ก่อน
- ถ้าใส่ `APPS_SCRIPT_INTAKE_URL` ระบบจะ forward JSON payload ไป Apps Script หลังบ้าน

ถ้าต้องการให้ Apps Script เป็น workflow backend จริง ต้องเพิ่ม/ยืนยัน `doPost(e)` ใน Apps Script ให้รับ JSON รูปแบบนี้:

```json
{
  "source": "weedwalker.net",
  "version": "intake-v1",
  "profile": {
    "fullName": "...",
    "phone": "...",
    "email": "..."
  },
  "telemed": {
    "conditionIntention": "..."
  },
  "consents": {
    "telemedConsent": true,
    "pdpaConsent": true
  },
  "signatureDataUrl": "data:image/png;base64,...",
  "files": []
}
```

ถ้าจะส่งรูป ID/Selfie ไป Apps Script ให้ตั้ง:

```env
APPS_SCRIPT_FORWARD_FILES="true"
NEXT_PUBLIC_APPS_SCRIPT_FORWARD_FILES="true"
```

และฝั่ง Apps Script ต้องรองรับ `files[].base64`

---

## Step 1: Create Neon database

1. เข้า [Neon](https://neon.tech/)
2. Create Project
3. เลือก region ที่ใกล้ผู้ใช้ไทยที่สุดที่ Neon มีให้
4. สร้าง database สำหรับ production เช่น `weedwalker`
5. เปิดหน้า Connection details

---

## Step 2: Copy Neon DATABASE_URL

คัดลอก PostgreSQL connection string จาก Neon แล้วให้แน่ใจว่ามี:

```text
?sslmode=require
```

ตัวอย่าง:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/weedwalker?sslmode=require"
```

ใช้ `DATABASE_URL` นี้ทั้งใน Vercel และตอนรัน Prisma migration

---

## Step 3: Push project to GitHub

จากโฟลเดอร์โปรเจกต์:

```bash
git add .
git commit -m "Prepare WEED WALKER Experience Platform for Vercel and Neon"
git push
```

ถ้ายังไม่มี GitHub repo ให้สร้าง repo ใหม่ก่อน แล้ว push โปรเจกต์นี้ขึ้นไป

---

## Step 4: Import project into Vercel

1. เข้า [Vercel](https://vercel.com/)
2. เลือก Add New Project
3. Import GitHub repo ของโปรเจกต์นี้
4. ถ้า repo มีหลายโฟลเดอร์ ให้ตั้ง Root Directory เป็น:

```text
weedwalker-experience-platform
```

5. Framework Preset: Next.js
6. Install Command:

```bash
npm install
```

7. Build Command:

```bash
npm run build
```

---

## Step 5: Add environment variables

ใน Vercel ไปที่ Project Settings → Environment Variables แล้วเพิ่มค่าต่อไปนี้ใน Production:

```env
DATABASE_URL="..."
SESSION_SECRET="..."
APP_URL="https://weedwalker.net"
NEXT_PUBLIC_APP_URL="https://weedwalker.net"
ENABLE_FILE_UPLOADS="false"
NEXT_PUBLIC_ENABLE_FILE_UPLOADS="false"
ENABLE_GOOGLE_LOGIN="false"
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN="false"
ENABLE_RANDOM_PROMO="false"
NEXT_PUBLIC_ENABLE_RANDOM_PROMO="false"
```

วิธีสร้าง `SESSION_SECRET` แบบง่าย:

```bash
openssl rand -base64 32
```

ถ้าเครื่องไม่มี `openssl` ให้ใช้ password generator แล้วใส่ string ยาวอย่างน้อย 32 ตัวอักษร

---

## Step 6: Run Prisma migration

หลังจากได้ `DATABASE_URL` ของ Neon แล้ว ให้รัน migration หนึ่งครั้งก่อนใช้งานจริง:

```bash
npm install
npm run db:generate
npm run db:migrate
```

ถ้ารันจากเครื่องตัวเอง ให้สร้างไฟล์ `.env` ในโปรเจกต์และใส่ `DATABASE_URL` ของ Neon ก่อน

ตัวอย่าง `.env` สำหรับ migration:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/weedwalker?sslmode=require"
```

คำสั่ง `npm run db:migrate` จะใช้ migration ในโฟลเดอร์ `prisma/migrations`

---

## Step 7: Deploy

กลับไปที่ Vercel แล้วกด Deploy หรือ Redeploy

หลัง deploy สำเร็จ ให้ผูก custom domain:

```text
weedwalker.net
```

ใน Vercel Project Settings → Domains

---

## Step 8: Test production pages

หลัง deploy แล้วให้ทดสอบ:

- `https://weedwalker.net/`
- `https://weedwalker.net/intake`
- `https://weedwalker.net/menu`
- `https://weedwalker.net/access`

สำหรับ `/intake` ให้ลองกรอกฟอร์มจริงหนึ่งครั้ง แล้วเช็กใน Neon ว่ามี record เพิ่มในตาราง:

- `IntakeSubmission`
- `ConsentRecord`
- `TelemedRequest` เฉพาะกรณีเลือกขอ Telemed

---

## Current production behavior

- Intake Portal ไม่บังคับ Google Login
- Intake text fields ส่งลง SQL database ได้
- Upload เอกสารปิดไว้ใน production รอบแรก เพื่อไม่ให้เว็บล่มจาก GCS env ที่ยังไม่พร้อม
- Member protected access ถูกปิดไว้จนกว่า Google Login จะพร้อม
- PDF generation ยังไม่เปิด
- Random/Lucky Draw ถูกปิดและไม่อยู่ใน main navigation

---

## Commands checklist

ใช้เช็กก่อน deploy:

```bash
npm install
npm run db:generate
npm run build
```
