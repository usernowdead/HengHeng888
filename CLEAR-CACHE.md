# วิธี Clear Build Cache ใน Vercel

## วิธีที่ 1: ผ่าน Vercel Dashboard (ง่ายที่สุด)

### ขั้นตอน:
1. ไปที่ **https://vercel.com/dashboard**
2. เลือก **Project** ของคุณ (heng-heng888)
3. คลิกแท็บ **Settings** (ด้านบน)
4. เลื่อนลงไปหา **Build & Development Settings**
5. กดปุ่ม **"Clear Build Cache"** (สีแดง)
6. ยืนยันการ Clear Cache
7. ไปที่แท็บ **Deployments**
8. กด **"Redeploy"** บน deployment ล่าสุด

---

## วิธีที่ 2: Force Redeploy (ปิด Build Cache)

### ขั้นตอน:
1. ไปที่ **https://vercel.com/dashboard**
2. เลือก **Project** ของคุณ
3. ไปที่แท็บ **Deployments**
4. คลิก **"..."** (เมนู 3 จุด) บน deployment ล่าสุด
5. เลือก **"Redeploy"**
6. **ปิด** "Use existing Build Cache" (ให้เป็น OFF)
7. กด **"Redeploy"**

---

## วิธีที่ 3: ใช้ Vercel CLI (ถ้าติดตั้งแล้ว)

```bash
# Install Vercel CLI (ถ้ายังไม่มี)
npm i -g vercel

# Login
vercel login

# Clear cache และ redeploy
vercel --force
```

---

## หมายเหตุ

- **Clear Build Cache** จะลบ cache ทั้งหมด ทำให้ build ช้ากว่าเดิม แต่จะได้ code ใหม่แน่นอน
- **Force Redeploy** จะ build ใหม่โดยไม่ใช้ cache
- หลังจาก clear cache แล้ว build ควรจะผ่าน

---

## ถ้ายังไม่ได้

ลอง:
1. รอสักครู่ (อาจมี delay)
2. ตรวจสอบว่า code ถูก push ไป GitHub แล้ว
3. ตรวจสอบ build logs ใน Vercel ว่ามี error อื่นหรือไม่

