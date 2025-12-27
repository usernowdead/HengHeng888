# ⚙️ ตั้งค่า Vercel Deployment

## 📋 ขั้นตอนการ Deploy

### 1. ตรวจสอบการตั้งค่าในหน้า Vercel

✅ **Project Name:** `heng-heng888` (ถูกต้อง)
✅ **Framework Preset:** `Next.js` (ถูกต้อง)
✅ **Root Directory:** `./` (ถูกต้อง - เพราะเรา push จากโฟลเดอร์ deploy)

---

### 2. ตั้งค่า Build Settings (ถ้าจำเป็น)

กด **"Build and Output Settings"** แล้วตรวจสอบ:

- **Build Command:** `npm run build` (default - ถูกต้อง)
- **Output Directory:** `.next` (default - ถูกต้อง)
- **Install Command:** `npm install` (default - ถูกต้อง)

---

### 3. ตั้งค่า Environment Variables (สำคัญมาก!)

กด **"Environment Variables"** แล้วเพิ่ม:

#### Required Variables:

```env
# Database (จาก Supabase)
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

# Base URL (จะได้หลัง deploy - ใส่ชั่วคราวก่อน)
NEXT_PUBLIC_BASE_URL=https://heng-heng888.vercel.app

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

---

### 4. Deploy!

1. กด **"Deploy"** ด้านล่าง
2. รอ build เสร็จ (ประมาณ 2-5 นาที)
3. ตรวจสอบ logs ถ้ามี error

---

### 5. อัปเดต NEXT_PUBLIC_BASE_URL (หลัง Deploy)

หลัง deploy เสร็จ:
1. ไปที่ **Settings** → **Environment Variables**
2. อัปเดต `NEXT_PUBLIC_BASE_URL` เป็น URL จริง (เช่น `https://heng-heng888-xxx.vercel.app`)
3. **Redeploy**

---

## ⚠️ หมายเหตุ

- **Root Directory:** `./` ถูกต้องแล้ว (ไม่ต้องเปลี่ยน)
- **Environment Variables:** ต้องตั้งค่าก่อน deploy หรือหลัง deploy แล้ว redeploy
- **DATABASE_URL:** ต้องได้จาก Supabase ก่อน (ถ้ายังไม่มี ให้ deploy ก่อน แล้วค่อยตั้ง database ทีหลัง)

---

## 🎯 Quick Checklist

- [ ] Project Name: `heng-heng888` ✅
- [ ] Framework: `Next.js` ✅
- [ ] Root Directory: `./` ✅
- [ ] Environment Variables: ตั้งค่าแล้ว (หรือจะตั้งหลัง deploy)
- [ ] กด **Deploy**!

---

**พร้อม Deploy แล้ว! 🚀**

