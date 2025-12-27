# วิธีสร้าง Database ใน Supabase

## ขั้นตอนที่ 1: ตั้งค่า Database Connection

### 1.1 ไปที่ Supabase Dashboard
1. ไปที่ **https://supabase.com/dashboard**
2. เลือก Project ของคุณ (usernowdead's Project)

### 1.2 หา Database URL
1. ไปที่ **Settings** (ไอคอนเฟือง) → **Database**
2. เลื่อนลงไปหา **Connection string**
3. เลือก **URI** tab
4. Copy **Connection string** (จะมี format แบบนี้):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 1.3 ตั้งค่า Password
1. ในหน้า **Database** → **Database password**
2. กด **Generate new password** (ถ้ายังไม่มี)
3. **บันทึก password ไว้!** (จะใช้ไม่ได้อีกถ้าลืม)

---

## ขั้นตอนที่ 2: Run Database Migrations

### 2.1 ตั้งค่า DATABASE_URL ใน Vercel
1. ไปที่ **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. เพิ่ม:
   - **Key:** `DATABASE_URL`
   - **Value:** (ใส่ Connection string จาก Supabase)
   - **Environment:** Production, Preview, Development (เลือกทั้งหมด)
3. กด **Save**

### 2.2 Run Migrations (วิธีที่ 1: ใช้ Vercel)

**Option A: ใช้ Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd deploy
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

**Option B: ใช้ Supabase SQL Editor**
1. ไปที่ Supabase Dashboard → **SQL Editor**
2. Copy SQL จาก `prisma/migrations` folder
3. Paste และ Run

---

## ขั้นตอนที่ 3: ใช้ Prisma Migrate (แนะนำ)

### 3.1 ตั้งค่า DATABASE_URL ใน Local
```bash
# ในโฟลเดอร์ deploy
# สร้างไฟล์ .env.local
echo "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > .env.local
```

### 3.2 Run Migrations
```bash
cd deploy

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

---

## ขั้นตอนที่ 4: ตรวจสอบ Database

### 4.1 ใช้ Supabase Table Editor
1. ไปที่ Supabase Dashboard → **Table Editor**
2. ตรวจสอบว่ามี tables ถูกสร้างแล้ว:
   - `users`
   - `movies`
   - `transactions`
   - `orders`
   - `website_settings`
   - อื่นๆ

### 4.2 ใช้ Prisma Studio (Local)
```bash
cd deploy
npx prisma studio
```
จะเปิด browser ที่ `http://localhost:5555` ให้ดู database

---

## ขั้นตอนที่ 5: สร้าง Admin User

### 5.1 ใช้ Setup API
1. ไปที่ `https://heng-heng888.vercel.app/api/setup`
2. จะสร้าง admin user อัตโนมัติ:
   - Email: `admin@payplearn.com`
   - Password: (ดูใน code หรือตั้งใหม่)

### 5.2 หรือใช้ SQL
```sql
-- ไปที่ Supabase SQL Editor
-- Run SQL นี้:

INSERT INTO users (email, username, password, role, balance)
VALUES (
  'admin@payplearn.com',
  'admin',
  '$2b$10$...', -- hashed password
  1, -- admin role
  0
);
```

---

## Checklist

- [ ] สร้าง Supabase Project แล้ว
- [ ] Copy Database URL แล้ว
- [ ] ตั้งค่า DATABASE_URL ใน Vercel แล้ว
- [ ] Run migrations แล้ว
- [ ] ตรวจสอบ tables แล้ว
- [ ] สร้าง admin user แล้ว

---

## Troubleshooting

### Error: "relation does not exist"
→ ยังไม่ได้ run migrations → Run `npx prisma migrate deploy`

### Error: "password authentication failed"
→ Password ผิด → ตรวจสอบ password ใน Supabase Settings

### Error: "connection refused"
→ Database URL ผิด → ตรวจสอบ Connection string

---

## หมายเหตุ

- **Database URL** ต้องเก็บเป็นความลับ
- **Password** ต้องบันทึกไว้ (จะใช้ไม่ได้อีกถ้าลืม)
- **Migrations** ต้อง run ทุกครั้งที่ schema เปลี่ยน

