# วิธี Run Migrations เพื่อให้สมัครสมาชิกได้

## ⚠️ ปัญหา: สมัครสมาชิกไม่ได้

**สาเหตุ:** Database ยังไม่มี tables → ต้อง run migrations ก่อน!

---

## ขั้นตอนที่ 1: ตรวจสอบว่า Database มี Tables หรือยัง

1. ไปที่ **Supabase Dashboard** → **Table Editor**
2. ดูว่ามี tables หรือไม่:
   - ✅ ถ้ามี `users`, `orders`, `transactions` → **ผ่าน!** (ข้ามไปขั้นตอนที่ 3)
   - ❌ ถ้าไม่มี → **ต้อง run migrations!** (ทำขั้นตอนที่ 2)

---

## ขั้นตอนที่ 2: Run Migrations (ถ้ายังไม่มี Tables)

### วิธีที่ 1: ใช้ Supabase SQL Editor (แนะนำ - ง่ายที่สุด)

#### 2.1 ไปที่ SQL Editor
1. ไปที่ **Supabase Dashboard**
2. คลิก **"SQL Editor"** (ใน Left Sidebar)
3. กด **"New query"** (ถ้ามี)

#### 2.2 Run Migration แรก (สร้าง Tables หลัก)
1. เปิดไฟล์: `prisma/migrations/20251222214449_init/migration.sql`
2. **Copy SQL ทั้งหมด** จากไฟล์
3. **Paste** ใน SQL Editor
4. กด **Run** (หรือ Ctrl+Enter)
5. รอให้เสร็จ (ควรเห็น "Success")

#### 2.3 Run Migration ที่ 2 (เพิ่ม Foreign Keys)
1. เปิดไฟล์: `prisma/migrations/20251224220906_restore_user_and_related_tables/migration.sql`
2. **Copy SQL ทั้งหมด**
3. **Paste** ใน SQL Editor (ใหม่)
4. กด **Run**
5. รอให้เสร็จ

#### 2.4 Run Migrations อื่นๆ (ถ้ามี)
ทำซ้ำกับ migrations อื่นๆ:
- `20251224220301_add_movie_and_website_settings_models/migration.sql`
- `20251224235403_add_type_to_movies/migration.sql`
- `20251225161102_add_platform_to_movies/migration.sql`

---

### วิธีที่ 2: ใช้ Prisma Migrate (ถ้าต้องการ)

```bash
# 1. ไปที่โฟลเดอร์ deploy
cd deploy

# 2. สร้าง .env.local (ถ้ายังไม่มี)
echo "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.vvblllgniahrqmlklkvm.supabase.co:5432/postgres" > .env.local

# 3. Run migrations
npx prisma migrate deploy
```

---

## ขั้นตอนที่ 3: ตรวจสอบ Tables

1. ไปที่ **Supabase Dashboard** → **Table Editor**
2. ตรวจสอบว่ามี tables:
   - ✅ `users` - สำหรับเก็บข้อมูลผู้ใช้
   - ✅ `orders` - สำหรับเก็บคำสั่งซื้อ
   - ✅ `transactions` - สำหรับเก็บรายการธุรกรรม
   - ✅ `movies` - สำหรับเก็บข้อมูลหนัง
   - ✅ `website_settings` - สำหรับเก็บการตั้งค่าเว็บ
   - ✅ `qr_sessions` - สำหรับเก็บ session QR code

---

## ขั้นตอนที่ 4: ทดสอบสมัครสมาชิก

1. ไปที่เว็บไซต์: `https://heng-heng888.vercel.app`
2. กด **"เข้าสู่ระบบ"** → **"สมัครสมาชิก"**
3. กรอกข้อมูล:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `Test1234` (ต้องมีตัวพิมพ์ใหญ่!)
   - Confirm Password: `Test1234`
4. กด **"สมัครสมาชิก"**
5. ควรสมัครสำเร็จ!

---

## Checklist

- [ ] ตรวจสอบว่า Database มี tables หรือยัง
- [ ] Run migrations แล้ว (ถ้ายังไม่มี tables)
- [ ] ตรวจสอบ tables ใน Table Editor แล้ว
- [ ] ทดสอบสมัครสมาชิกแล้ว

---

## Troubleshooting

### Error: "relation 'users' does not exist"
→ ยังไม่ได้ run migrations → Run migrations ก่อน!

### Error: "password authentication failed"
→ Database URL ผิด → ตรวจสอบ password ใน Connection String

### Error: "duplicate key value violates unique constraint"
→ User มีอยู่แล้ว → ใช้ email/username อื่น

### Error: "รหัสผ่านไม่ตรงกัน"
→ Password กับ Confirm Password ไม่ตรงกัน → ตรวจสอบอีกครั้ง

### Error: "รหัสผ่านปานกลาง. ต้องประกอบด้วย: อย่างน้อย 1 ตัวอักษรพิมพ์ใหญ่"
→ Password ต้องมีตัวพิมพ์ใหญ่ → ใช้ `Test1234` แทน `test1234`

---

## หมายเหตุ

- **Migrations** ต้อง run ทุกครั้งที่ schema เปลี่ยน
- **Password** ต้องมีตัวพิมพ์ใหญ่ (ตาม requirement)
- **Database** ต้องมี tables ก่อนสมัครสมาชิก

