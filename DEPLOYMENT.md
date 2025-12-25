# 🚀 Deployment Guide - Oho568

คู่มือการ Deploy โปรเจค Oho568 ไปยัง Vercel และ Supabase

---

## 📋 สารบัญ

1. [Prerequisites](#prerequisites)
2. [Deploy to Supabase (Database)](#deploy-to-supabase-database)
3. [Deploy to Vercel (Frontend + Backend)](#deploy-to-vercel-frontend--backend)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

### สิ่งที่ต้องมี:
- ✅ GitHub account
- ✅ Vercel account (เชื่อมต่อกับ GitHub)
- ✅ Supabase account
- ✅ Node.js 20+ (สำหรับ local development)

---

## 🗄️ Deploy to Supabase (Database)

### ขั้นตอนที่ 1: สร้าง Supabase Project

1. ไปที่ [https://supabase.com](https://supabase.com)
2. สร้าง New Project
3. ตั้งชื่อ Project: `oho568` (หรือชื่อที่ต้องการ)
4. ตั้ง Password สำหรับ Database (จดไว้!)
5. เลือก Region: `Southeast Asia (Singapore)` (ใกล้ที่สุด)
6. กด **Create new project**

### ขั้นตอนที่ 2: รับ Database URL

1. ไปที่ **Settings** → **Database**
2. คัดลอก **Connection string** → **URI**
3. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
4. **เก็บไว้ใช้ใน Vercel!**

### ขั้นตอนที่ 3: Run Prisma Migrations

#### วิธีที่ 1: ใช้ Supabase SQL Editor (แนะนำ)

1. ไปที่ **SQL Editor** ใน Supabase Dashboard
2. เปิดไฟล์ `prisma/migrations/[latest]/migration.sql`
3. Copy SQL ทั้งหมด
4. Paste ใน SQL Editor
5. กด **Run**

#### วิธีที่ 2: ใช้ Prisma CLI (Local)

```bash
# ตั้งค่า DATABASE_URL
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### ขั้นตอนที่ 4: สร้าง Admin User

```bash
# ตั้งค่า DATABASE_URL ก่อน
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run create admin script
npm run create-admin
# หรือ
node scripts/create-admin.js
```

**Default Admin:**
- Username: `admin`
- Email: `admin@oho568.com`
- Password: `admin123456` (เปลี่ยนทันทีหลัง login!)

---

## 🌐 Deploy to Vercel (Frontend + Backend)

### ขั้นตอนที่ 1: Push Code to GitHub

```bash
# Initialize git (ถ้ายังไม่มี)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create repository on GitHub แล้ว push
git remote add origin https://github.com/yourusername/oho568.git
git branch -M main
git push -u origin main
```

### ขั้นตอนที่ 2: Deploy to Vercel

1. ไปที่ [https://vercel.com](https://vercel.com)
2. กด **Add New Project**
3. Import Git Repository (เลือก repo ที่เพิ่ง push)
4. Vercel จะ auto-detect Next.js
5. **ตั้งค่า Build Settings:**
   - Framework Preset: `Next.js`
   - Root Directory: `./` (root)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

ใน Vercel Dashboard → **Settings** → **Environment Variables** เพิ่ม:

#### Required Variables:

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long

# API Keys
API_KEY_MIDDLE=your_middle_pay_api_key
API_KEY_ADS4U=your_ads4u_api_key
API_KEY_PEAMSUB=your_peamsub_api_key
API_KEY_GAFIW=your_gafiw_api_key
API_KEY_EASYSLIP=your_easyslip_api_key
PAYMENT_GATEWAY_API_KEY=your_payment_gateway_api_key

# Base URL (จะได้หลัง deploy)
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app

# Node Environment
NODE_ENV=production
```

#### Optional Variables:

```env
# Redis (ถ้าใช้)
RATE_LIMIT_REDIS_URL=redis://...

# Cloudflare Turnstile (ถ้าใช้)
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### ขั้นตอนที่ 4: Deploy!

1. กด **Deploy**
2. รอ build เสร็จ (ประมาณ 2-5 นาที)
3. ตรวจสอบ logs ถ้ามี error

---

## ⚙️ Post-Deployment Setup

### 1. อัปเดต NEXT_PUBLIC_BASE_URL

หลัง deploy เสร็จ:
1. ไปที่ Vercel Dashboard → **Settings** → **Environment Variables**
2. อัปเดต `NEXT_PUBLIC_BASE_URL` เป็น URL จริงของ Vercel
3. Redeploy

### 2. ตั้งค่า Website Settings

1. ไปที่ `https://your-project.vercel.app/admin/website-settings`
2. Login ด้วย admin account
3. ตั้งค่า:
   - ชื่อเว็บไซต์: `Oho568`
   - Logo URL (ถ้ามี)
   - Announcement
   - อื่นๆ ตามต้องการ

### 3. ตั้งค่า Custom Domain (Optional)

1. ไปที่ Vercel Dashboard → **Settings** → **Domains**
2. เพิ่ม domain ของคุณ
3. ตั้งค่า DNS records ตามที่ Vercel บอก

---

## 🔧 Troubleshooting

### ปัญหา: Build Failed

**สาเหตุ:** Environment variables ไม่ครบ

**แก้ไข:**
- ตรวจสอบว่าใส่ environment variables ครบทุกตัว
- ตรวจสอบ format ของ DATABASE_URL

### ปัญหา: Database Connection Error

**สาเหตุ:** DATABASE_URL ไม่ถูกต้อง หรือ Supabase firewall block

**แก้ไข:**
1. ตรวจสอบ DATABASE_URL ใน Vercel
2. ไปที่ Supabase → **Settings** → **Database** → **Connection Pooling**
3. เปิด **Connection Pooling** (ถ้ายังไม่เปิด)

### ปัญหา: Prisma Client Error

**สาเหตุ:** Prisma Client ยังไม่ generate

**แก้ไข:**
- Vercel จะรัน `postinstall` script อัตโนมัติ (มี `prisma generate`)
- ถ้ายังไม่ได้ ให้เพิ่มใน `package.json`:
  ```json
  "postinstall": "prisma generate"
  ```

### ปัญหา: API Routes ไม่ทำงาน

**สาเหตุ:** Environment variables ไม่ถูก load

**แก้ไข:**
- ตรวจสอบว่าใส่ environment variables ใน Vercel แล้ว
- Redeploy หลังเพิ่ม environment variables

---

## 📝 Checklist ก่อน Deploy

- [ ] Push code ไป GitHub แล้ว
- [ ] สร้าง Supabase project แล้ว
- [ ] Run Prisma migrations ใน Supabase แล้ว
- [ ] สร้าง admin user แล้ว
- [ ] ตั้งค่า Environment Variables ใน Vercel แล้ว
- [ ] ตรวจสอบว่า `.vercelignore` มีไฟล์ที่ไม่จำเป็น
- [ ] ตรวจสอบว่า `.gitignore` มี `.env*` แล้ว

---

## 🎉 เสร็จแล้ว!

หลัง deploy เสร็จ:
- Frontend + Backend: `https://your-project.vercel.app`
- Database: Supabase Dashboard
- Admin Panel: `https://your-project.vercel.app/admin`

---

## 📞 Support

ถ้ามีปัญหา:
1. ตรวจสอบ Vercel Build Logs
2. ตรวจสอบ Supabase Logs
3. ตรวจสอบ Browser Console
4. ตรวจสอบ Network Tab

---

**Last Updated:** 2025-01-XX

