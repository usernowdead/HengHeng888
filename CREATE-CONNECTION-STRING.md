# วิธีสร้าง Connection String เอง (ถ้าหาไม่เจอ)

## ถ้า Connection String ไม่มีใน Database Settings

ให้สร้างเองจากข้อมูลที่มี!

---

## ขั้นตอนที่ 1: หาข้อมูลที่ต้องใช้

### 1.1 หา Project Reference
1. ไปที่ **Project Settings** → **General**
2. หา **"Project ID"** (จะเห็น `vvblllgniahrqmlklkvm`)
3. **Copy** Project ID นี้

### 1.2 ตั้งค่า Password
1. ไปที่ **Database Settings** → **Database password**
2. กด **"Reset database password"**
3. **บันทึก password ไว้!** (จะใช้ไม่ได้อีกถ้าลืม)

---

## ขั้นตอนที่ 2: สร้าง Connection String

### Format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

### ตัวอย่าง:
```
postgresql://postgres:your_password_here@db.vvblllgniahrqmlklkvm.supabase.co:5432/postgres
```

### แทนที่:
- `[YOUR-PASSWORD]` → password ที่ตั้งไว้
- `[PROJECT-ID]` → Project ID (`vvblllgniahrqmlklkvm`)

---

## ขั้นตอนที่ 3: ตรวจสอบ Connection String

### ตัวอย่างที่ถูกต้อง:
```
postgresql://postgres:MyPassword123@db.vvblllgniahrqmlklkvm.supabase.co:5432/postgres
```

**ส่วนประกอบ:**
- `postgresql://` - Protocol
- `postgres` - Username
- `MyPassword123` - Password (ใส่ password จริง)
- `db.vvblllgniahrqmlklkvm.supabase.co` - Host (ใช้ Project ID)
- `5432` - Port
- `postgres` - Database name

---

## ขั้นตอนที่ 4: ตั้งค่าใน Vercel

1. ไปที่ **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. กด **"Add New"**
3. ใส่:
   - **Key:** `DATABASE_URL`
   - **Value:** (ใส่ Connection string ที่สร้างไว้)
   - **Environment:** เลือกทั้งหมด (Production, Preview, Development)
4. กด **Save**

---

## Checklist

- [ ] หา Project ID แล้ว (`vvblllgniahrqmlklkvm`)
- [ ] ตั้งค่า Password แล้ว
- [ ] สร้าง Connection String แล้ว
- [ ] ตั้งค่า DATABASE_URL ใน Vercel แล้ว

---

## หมายเหตุ

- **Password** ต้องบันทึกไว้ (จะใช้ไม่ได้อีกถ้าลืม)
- **Connection String** ต้องเก็บเป็นความลับ
- ถ้ายังไม่ได้ ลองดูที่ **API Settings** → **Database** section

