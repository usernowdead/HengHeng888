# 🚀 Quick Deploy Guide - Payplearn

## 📦 โฟลเดอร์นี้พร้อม Deploy แล้ว!

### ✅ สิ่งที่รวมอยู่:
- `src/` - Source code ทั้งหมด
- `public/` - Static files (รูปภาพ, icons)
- `prisma/` - Database schema และ migrations
- `package.json` - Dependencies
- Config files ทั้งหมด

---

## 🚀 วิธี Deploy

### 1. Push ไป GitHub

```bash
cd deploy
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/yourusername/payplearn.git
git push -u origin main
```

### 2. Deploy ไป Vercel

1. ไปที่ [https://vercel.com](https://vercel.com)
2. กด **Add New Project**
3. Import Git Repository (เลือก repo ที่เพิ่ง push)
4. Vercel จะ auto-detect Next.js
5. **ตั้งค่า Environment Variables** (ดูด้านล่าง)
6. กด **Deploy**

### 3. ตั้งค่า Environment Variables ใน Vercel

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long
API_KEY_MIDDLE=your_middle_pay_api_key
API_KEY_ADS4U=your_ads4u_api_key
API_KEY_PEAMSUB=your_peamsub_api_key
API_KEY_GAFIW=your_gafiw_api_key
API_KEY_EASYSLIP=your_easyslip_api_key
PAYMENT_GATEWAY_API_KEY=your_payment_gateway_api_key
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
NODE_ENV=production
```

### 4. Deploy Database ไป Supabase

1. สร้าง Supabase Project
2. ไปที่ **SQL Editor**
3. Run migrations จาก `prisma/migrations/`
4. สร้าง admin user

---

## 📝 หมายเหตุ

- ไฟล์ `.env*` ไม่ได้รวมอยู่ (ใช้ Vercel Environment Variables แทน)
- `node_modules/` จะถูก install อัตโนมัติใน Vercel
- `src/generated/prisma/` จะถูก generate อัตโนมัติใน Vercel

---

**พร้อม Deploy แล้ว! 🎉**

