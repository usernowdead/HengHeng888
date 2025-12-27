# วิธี Run Database Migrations ใน Supabase

## ⚠️ ปัญหา: สมัครสมาชิกไม่ได้

**สาเหตุ:** Database ยังไม่มี tables → ต้อง run migrations ก่อน!

---

## ขั้นตอนที่ 1: ตรวจสอบว่า Database มี Tables หรือยัง

1. ไปที่ **Supabase Dashboard** → **Table Editor**
2. ดูว่ามี tables หรือไม่:
   - ถ้ามี `users`, `orders`, `transactions`, etc. → **ผ่าน!** (ข้ามไปขั้นตอนที่ 2)
   - ถ้าไม่มี → **ต้อง run migrations!** (ทำขั้นตอนที่ 2)

---

## ขั้นตอนที่ 2: Run Migrations

### วิธีที่ 1: ใช้ Supabase SQL Editor (แนะนำ - ง่ายที่สุด)

1. ไปที่ **Supabase Dashboard** → **SQL Editor**
2. เปิดไฟล์ `prisma/migrations/20251222214449_init/migration.sql`
3. **Copy SQL ทั้งหมด** จากไฟล์
4. **Paste** ใน SQL Editor
5. กด **Run** (หรือ Ctrl+Enter)
6. **ทำซ้ำ** กับ migrations อื่นๆ (ถ้ามี):
   - `20251224220301_add_movie_and_website_settings_models/migration.sql`
   - `20251224220906_restore_user_and_related_tables/migration.sql`
   - `20251224235403_add_type_to_movies/migration.sql`
   - `20251225161102_add_platform_to_movies/migration.sql`

### วิธีที่ 2: ใช้ Prisma Migrate (ถ้าต้องการ)

```bash
# ในโฟลเดอร์ deploy
# 1. สร้าง .env.local (ถ้ายังไม่มี)
echo "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.vvblllgniahrqmlklkvm.supabase.co:5432/postgres" > .env.local

# 2. Run migrations
npx prisma migrate deploy
```

---

## ขั้นตอนที่ 3: ตรวจสอบ Tables

1. ไปที่ **Supabase Dashboard** → **Table Editor**
2. ตรวจสอบว่ามี tables:
   - ✅ `users`
   - ✅ `orders`
   - ✅ `transactions`
   - ✅ `movies`
   - ✅ `website_settings`
   - ✅ `qr_sessions`

---

## ขั้นตอนที่ 4: สร้าง Admin User

### วิธีที่ 1: ใช้ Setup API (แนะนำ)

1. ไปที่ `https://heng-heng888.vercel.app/api/setup`
2. จะสร้าง admin user อัตโนมัติ:
   - Email: `admin@payplearn.com`
   - Password: (ดูใน code หรือตั้งใหม่)

### วิธีที่ 2: ใช้ SQL

```sql
-- ไปที่ Supabase SQL Editor
-- Run SQL นี้:

INSERT INTO users (id, email, username, password, role, balance, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'admin@payplearn.com',
  'admin',
  '$2b$10$...', -- hashed password (ต้อง hash ก่อน)
  1, -- admin role
  0,
  NOW(),
  NOW()
);
```

---

## Checklist

- [ ] ตรวจสอบว่า Database มี tables หรือยัง
- [ ] Run migrations แล้ว (ถ้ายังไม่มี tables)
- [ ] ตรวจสอบ tables ใน Table Editor แล้ว
- [ ] สร้าง admin user แล้ว
- [ ] ทดสอบสมัครสมาชิกแล้ว

---

## Troubleshooting

### Error: "relation 'users' does not exist"
→ ยังไม่ได้ run migrations → Run migrations ก่อน!

### Error: "duplicate key value violates unique constraint"
→ User มีอยู่แล้ว → ใช้ email/username อื่น

### Error: "password authentication failed"
→ Database URL ผิด → ตรวจสอบ password ใน Connection String

---

## หมายเหตุ

- **Migrations** ต้อง run ทุกครั้งที่ schema เปลี่ยน
- **Admin user** ต้องสร้างก่อนใช้งาน
- **Database** ต้องมี tables ก่อนสมัครสมาชิก

