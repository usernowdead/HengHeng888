# คู่มือการติดตั้ง Premium App Store

## สิ่งที่ต้องติดตั้งก่อน

### 1. Node.js (สำหรับ Frontend)
- ดาวน์โหลดจาก: https://nodejs.org/
- ใช้เวอร์ชัน 18 หรือใหม่กว่า
- ✅ ติดตั้งแล้ว: Frontend dependencies ติดตั้งเสร็จแล้ว

### 2. Rust & Cargo (สำหรับ Backend)
- ดาวน์โหลด Rustup จาก: https://rustup.rs/
- หรือใช้คำสั่ง: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Windows: ดาวน์โหลด rustup-init.exe จาก https://rustup.rs/

### 3. PostgreSQL (Database)
มี 2 วิธี:

#### วิธีที่ 1: ใช้ Docker (แนะนำ - ง่ายที่สุด)
- ติดตั้ง Docker Desktop จาก: https://www.docker.com/products/docker-desktop
- เปิด Docker Desktop
- รันคำสั่ง: `docker-compose up -d`

#### วิธีที่ 2: ติดตั้ง PostgreSQL โดยตรง
- ดาวน์โหลดจาก: https://www.postgresql.org/download/
- สร้าง database ชื่อ `premium_appstore`
- สร้าง user `appstore_user` password `appstore_password`

### 4. sqlx-cli (สำหรับ Database Migrations)
หลังจากติดตั้ง Rust แล้ว:
```bash
cargo install sqlx-cli
```

## ขั้นตอนการติดตั้ง

### 1. Frontend (เสร็จแล้ว ✅)
```bash
cd frontend
npm install  # ✅ ติดตั้งเสร็จแล้ว
```

### 2. Database Setup

#### ถ้าใช้ Docker:
```bash
# ตรวจสอบว่า Docker Desktop เปิดอยู่
docker --version

# Start PostgreSQL
docker-compose up -d

# ตรวจสอบว่า container ทำงาน
docker ps
```

#### ถ้าใช้ PostgreSQL โดยตรง:
แก้ไข `backend/.env` ให้ตรงกับ connection ของคุณ

### 3. รัน Database Migrations
```bash
cd backend

# ถ้ายังไม่มี sqlx-cli
cargo install sqlx-cli

# รัน migrations (ปรับ DATABASE_URL ให้ตรงกับของคุณ)
sqlx migrate run --database-url postgresql://appstore_user:appstore_password@localhost:5432/premium_appstore
```

### 4. Backend Setup
```bash
cd backend

# สร้างไฟล์ .env (ถ้ายังไม่มี)
# เนื้อหาควรเป็น:
# DATABASE_URL=postgresql://appstore_user:appstore_password@localhost:5432/premium_appstore
# PORT=3001

# Build และ Run
cargo run
```

### 5. Frontend Setup
```bash
cd frontend

# สร้างไฟล์ .env.local (ถ้ายังไม่มี)
# เนื้อหาควรเป็น:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Run development server
npm run dev
```

## ตรวจสอบการติดตั้ง

1. ✅ Frontend: เปิดเบราว์เซอร์ที่ http://localhost:3000
2. ✅ Backend: เปิดเบราว์เซอร์ที่ http://localhost:3001/api/banners
3. ✅ Database: เช็คว่า PostgreSQL ทำงานอยู่

## Troubleshooting

### Docker ไม่ทำงาน
- ตรวจสอบว่า Docker Desktop เปิดอยู่
- ลองเปิด Docker Desktop และรัน `docker-compose up -d` อีกครั้ง

### Cargo ไม่พบ
- ตรวจสอบว่า Rust ติดตั้งแล้ว: `rustc --version`
- ถ้ายังไม่มี ติดตั้งจาก https://rustup.rs/

### Database connection error
- ตรวจสอบว่า PostgreSQL ทำงานอยู่
- ตรวจสอบ DATABASE_URL ในไฟล์ .env
- ถ้าใช้ Docker ตรวจสอบว่า container ทำงาน: `docker ps`

### Port already in use
- ถ้า port 3000 หรือ 3001 ถูกใช้แล้ว
- Frontend: แก้ใน package.json หรือใช้ `npm run dev -- -p 3002`
- Backend: แก้ PORT ในไฟล์ .env


