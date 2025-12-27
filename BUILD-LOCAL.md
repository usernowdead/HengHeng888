# วิธี Build Local ให้ผ่าน

## ปัญหา

เมื่อ run `npm run build` จะใช้ `NODE_ENV=production` ซึ่งเข้มงวดกว่า และต้องมี environment variables ครบ

## วิธีแก้

### วิธีที่ 1: ใช้ .env file (แนะนำ)

สร้างไฟล์ `.env` ในโฟลเดอร์ `deploy`:

```bash
JWT_SECRET=2738f975f5de03fb0171ad81d475df7d5b0164c450098e43c0fbe3e11114bfab474af0430b4fcccb6472f38bf3911cbfe76d3f5a0bb4ae0ff8c33a6fafdae80c
DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
```

### วิธีที่ 2: Set Environment Variables ก่อน Build

**Windows PowerShell:**
```powershell
$env:JWT_SECRET="2738f975f5de03fb0171ad81d475df7d5b0164c450098e43c0fbe3e11114bfab474af0430b4fcccb6472f38bf3911cbfe76d3f5a0bb4ae0ff8c33a6fafdae80c"
$env:DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
npm run build
```

**Windows CMD:**
```cmd
set JWT_SECRET=2738f975f5de03fb0171ad81d475df7d5b0164c450098e43c0fbe3e11114bfab474af0430b4fcccb6472f38bf3911cbfe76d3f5a0bb4ae0ff8c33a6fafdae80c
set DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
npm run build
```

**Linux/Mac:**
```bash
export JWT_SECRET=2738f975f5de03fb0171ad81d475df7d5b0164c450098e43c0fbe3e11114bfab474af0430b4fcccb6472f38bf3911cbfe76d3f5a0bb4ae0ff8c33a6fafdae80c
export DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
npm run build
```

## ตรวจสอบ

```bash
# ตรวจสอบว่า .env มีอยู่
ls .env

# ตรวจสอบว่า environment variables ถูก set
echo $JWT_SECRET  # Linux/Mac
echo %JWT_SECRET% # Windows CMD
$env:JWT_SECRET   # Windows PowerShell
```

## หมายเหตุ

- `.env` ถูก ignore โดย Git (ไม่ถูก push ไป GitHub)
- ใช้สำหรับ build local เท่านั้น
- Vercel ใช้ Environment Variables ใน Dashboard

## ถ้ายัง Build ไม่ผ่าน

1. ตรวจสอบว่า `.env` อยู่ในโฟลเดอร์ `deploy` (ไม่ใช่โฟลเดอร์ root)
2. ตรวจสอบว่า JWT_SECRET ยาว 32+ ตัวอักษร
3. ลอง set environment variables ก่อน build แทน

