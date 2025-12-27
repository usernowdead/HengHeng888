# วิธีหา Connection String ใน Supabase (แก้ไข)

## ⚠️ Connection String ไม่ได้อยู่ใน Database Settings!

Connection string อยู่ที่ **API Settings** แทน!

---

## ขั้นตอนที่ถูกต้อง:

### 1. ไปที่ Project Settings
1. ไปที่ **Supabase Dashboard**
2. เลือก Project ของคุณ
3. คลิก **"Project Settings"** (ไอคอนเฟือง ⚙️) - อยู่ล่างสุดของ sidebar

### 2. ไปที่ API Settings (ไม่ใช่ Database!)
1. ในหน้า **Project Settings**
2. ดูที่ **Left Sidebar** ใน Settings:
   - **General**
   - **Database** ← ไม่ใช่อันนี้!
   - **API** ← **คลิกอันนี้แทน!**
   - **Auth**
   - อื่นๆ

### 3. หา Connection String
1. หลังจากคลิก **API** แล้ว
2. เลื่อนลงไปหา **"Database"** section
3. จะเห็น:
   - **Connection string** (URI)
   - **Connection string** (JDBC)
   - **Connection string** (Golang)
   - อื่นๆ

4. **เลือก "Connection string (URI)"** ← อันนี้!
5. จะเห็น Connection string แบบนี้:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   หรือ
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

6. **Copy** Connection string นี้

---

## ภาพประกอบ (ตำแหน่งที่ถูกต้อง)

```
Supabase Dashboard
├── Left Sidebar
│   └── Project Settings ⚙️
│       ├── General
│       ├── Database ← ไม่ใช่อันนี้!
│       └── API ← คลิกอันนี้!
│           └── Database section
│               └── Connection string (URI) ← อันนี้!
```

---

## ถ้ายังหาไม่เจอ

### ลองวิธีนี้:

1. **ไปที่ SQL Editor** (ใน Left Sidebar)
2. ดูที่ **Connection info** (อาจจะแสดงอยู่ด้านบน)
3. หรือดูที่ **API Settings** → **Database** section

---

## ตัวอย่าง Connection String

### Format 1 (Direct connection):
```
postgresql://postgres:[YOUR-PASSWORD]@db.vvblllgniahrqmikikvm.supabase.co:5432/postgres
```

### Format 2 (Connection pooling):
```
postgresql://postgres.vvblllgniahrqmikikvm:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**แนะนำ:** ใช้ **Format 1** (Direct connection) สำหรับ Prisma

---

## Checklist

- [ ] ไปที่ Project Settings แล้ว
- [ ] คลิก **API** (ไม่ใช่ Database!) แล้ว
- [ ] หา Database section แล้ว
- [ ] Copy Connection string (URI) แล้ว
- [ ] ตั้งค่า Password แล้ว
- [ ] ตั้งค่า DATABASE_URL ใน Vercel แล้ว

---

## หมายเหตุ

- Connection string อยู่ที่ **API Settings** ไม่ใช่ Database Settings!
- ต้องใส่ **password** ลงใน Connection string
- Password อยู่ที่ **Database Settings** → **Database password**

