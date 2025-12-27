# คู่มือการติดตั้งและใช้งาน Premium App Store

## ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Dependencies

#### Frontend (Next.js)
```bash
cd frontend
npm install
```

#### Backend (Rust)
```bash
cd backend
cargo build
```

### 2. ตั้งค่า PostgreSQL

#### ใช้ Docker (แนะนำ)
```bash
# เริ่ม PostgreSQL container
docker-compose up -d

# ตรวจสอบว่า container ทำงาน
docker ps
```

#### ติดตั้งเอง
สร้างฐานข้อมูลชื่อ `premium_appstore` ใน PostgreSQL

### 3. ตั้งค่า Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
# แก้ไข .env ให้ตรงกับ database connection ของคุณ
```

ตัวอย่าง `.env`:
```
DATABASE_URL=postgresql://appstore_user:appstore_password@localhost:5432/premium_appstore
PORT=3001
```

#### Frontend
```bash
cd frontend
cp .env.example .env.local
```

ตัวอย่าง `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. รัน Database Migrations

```bash
cd backend

# ติดตั้ง sqlx-cli (ถ้ายังไม่มี)
cargo install sqlx-cli

# รัน migrations
sqlx migrate run
```

หรือถ้าใช้ Docker และมี sqlx-cli แล้ว:
```bash
sqlx migrate run --database-url postgresql://appstore_user:appstore_password@localhost:5432/premium_appstore
```

### 5. เริ่มต้น Server

#### Backend (Terminal 1)
```bash
cd backend
cargo run
```

Server จะรันที่ `http://localhost:3001`

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Frontend จะรันที่ `http://localhost:3000`

## การใช้งาน

### หน้าแรก (Home Page)
- ไปที่ `http://localhost:3000`
- จะเห็น Banner Slider, Categories, และ Product Grid

### Admin Dashboard
- ไปที่ `http://localhost:3000/admin`
- ใช้จัดการสินค้าและ Banner

## Database Schema

### Tables

#### `banners`
- id (UUID)
- image_url (TEXT)
- title (TEXT, nullable)
- description (TEXT, nullable)
- link_url (TEXT, nullable)
- display_order (INTEGER)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)

#### `categories`
- id (UUID)
- name (TEXT, unique)
- slug (TEXT, unique)
- description (TEXT, nullable)
- icon_url (TEXT, nullable)
- display_order (INTEGER)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)

#### `products`
- id (UUID)
- category_id (UUID, foreign key)
- name (TEXT)
- slug (TEXT, unique)
- description (TEXT, nullable)
- price (DECIMAL)
- image_url (TEXT, nullable)
- platform (TEXT, nullable)
- version (TEXT, nullable)
- is_premium (BOOLEAN)
- is_active (BOOLEAN)
- display_order (INTEGER)
- created_at, updated_at (TIMESTAMP)

## API Endpoints

### Public APIs

#### GET /api/banners
ดึง Banner ทั้งหมดที่ active
```json
Response: [
  {
    "id": "uuid",
    "image_url": "https://...",
    "title": "...",
    "description": "...",
    ...
  }
]
```

#### GET /api/products?category=movie
ดึงสินค้าตามหมวดหมู่
```json
Response: [
  {
    "id": "uuid",
    "category_id": "uuid",
    "name": "...",
    "price": 299.00,
    ...
  }
]
```

### Admin APIs

#### POST /api/admin/product
เพิ่มสินค้าใหม่
```json
Request: {
  "category_id": "uuid",
  "name": "ชื่อสินค้า",
  "slug": "product-slug",
  "description": "...",
  "price": 299.00,
  "image_url": "https://...",
  "platform": "iOS",
  "version": "1.0.0"
}
```

#### POST /api/admin/product/delete
ลบสินค้า
```json
Request: {
  "id": "uuid"
}
```

#### POST /api/admin/banner
เพิ่ม Banner ใหม่
```json
Request: {
  "image_url": "https://...",
  "title": "...",
  "description": "...",
  "link_url": "https://..."
}
```

## หมายเหตุ

- Frontend ออกแบบเป็น Mobile-first (max-width: 480px)
- ต้องรัน Backend ก่อน Frontend ถึงจะเรียก API ได้
- รูปภาพที่ใช้ในตัวอย่างควรเป็น URL ที่เข้าถึงได้จริง หรือใช้ placeholder service


