# วิธีหา Database URL ใน Supabase (แบบละเอียด)

## ขั้นตอนที่ 1: ไปที่ Settings

1. ไปที่ **Supabase Dashboard**
2. เลือก Project ของคุณ (usernowdead's Project)
3. ดูที่ **Left Sidebar** (แถบซ้าย)
4. **คลิก "Project Settings"** (ไอคอนเฟือง ⚙️) - อยู่ล่างสุดของ sidebar

---

## ขั้นตอนที่ 2: หา Database URL

### วิธีที่ 1: ใช้ Connection String (แนะนำ)

1. ในหน้า **Project Settings**
2. ดูที่ **Left Sidebar** ใน Settings:
   - **General**
   - **Database** ← **คลิกอันนี้!**
   - **API**
   - **Auth**
   - อื่นๆ

3. หลังจากคลิก **Database** แล้ว:
   - เลื่อนลงไปหา **"Connection string"** section
   - จะมีหลาย tabs: **URI**, **JDBC**, **Golang**, **Python**, etc.
   - **เลือก tab "URI"** ← อันนี้!

4. จะเห็น Connection string แบบนี้:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.vvblllgniahrqmikikvm.supabase.co:5432/postgres
   ```

5. **Copy** Connection string นี้

---

## ขั้นตอนที่ 3: ตั้งค่า Password

### ถ้ายังไม่มี Password:

1. ในหน้า **Database** settings
2. หา section **"Database password"**
3. กด **"Generate new password"** หรือ **"Reset database password"**
4. **บันทึก password ไว้!** (จะใช้ไม่ได้อีกถ้าลืม)

### ถ้ามี Password แล้ว:

1. ใส่ password ลงใน Connection string:
   ```
   postgresql://postgres:YOUR_PASSWORD_HERE@db.vvblllgniahrqmikikvm.supabase.co:5432/postgres
   ```
   แทนที่ `[YOUR-PASSWORD]` ด้วย password จริง

---

## ขั้นตอนที่ 4: ตั้งค่าใน Vercel

1. ไปที่ **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. กด **"Add New"**
3. ใส่:
   - **Key:** `DATABASE_URL`
   - **Value:** (ใส่ Connection string ที่ copy มา)
   - **Environment:** เลือกทั้งหมด (Production, Preview, Development)
4. กด **Save**

---

## ภาพประกอบ (ตำแหน่ง)

```
Supabase Dashboard
├── Left Sidebar
│   ├── Project Overview
│   ├── Table Editor
│   ├── SQL Editor
│   ├── Database
│   ├── Authentication
│   ├── ...
│   └── Project Settings ⚙️ ← คลิกอันนี้!
│       ├── General
│       ├── Database ← คลิกอันนี้!
│       │   └── Connection string
│       │       └── URI tab ← เลือกอันนี้!
│       ├── API
│       └── ...
```

---

## ถ้ายังหาไม่เจอ

### ลองวิธีนี้:

1. **ไปที่ SQL Editor** (ใน Left Sidebar)
2. ดูที่ **Connection info** (อาจจะแสดงอยู่ด้านบน)
3. หรือดูที่ **API Settings** → **Database URL**

---

## ตัวอย่าง Connection String

```
postgresql://postgres:your_password_here@db.vvblllgniahrqmikikvm.supabase.co:5432/postgres
```

**ส่วนประกอบ:**
- `postgresql://` - Protocol
- `postgres` - Username
- `your_password_here` - Password (ต้องใส่เอง)
- `db.vvblllgniahrqmikikvm.supabase.co` - Host
- `5432` - Port
- `postgres` - Database name

---

## Checklist

- [ ] ไปที่ Project Settings แล้ว
- [ ] คลิก Database แล้ว
- [ ] หา Connection string แล้ว
- [ ] Copy Connection string แล้ว
- [ ] ตั้งค่า Password แล้ว
- [ ] ตั้งค่า DATABASE_URL ใน Vercel แล้ว

---

## หมายเหตุ

- **Password** ต้องบันทึกไว้ (จะใช้ไม่ได้อีกถ้าลืม)
- **Connection string** ต้องเก็บเป็นความลับ
- ถ้ายังหาไม่เจอ ลองดูที่ **API Settings** → **Database URL** ก็ได้

