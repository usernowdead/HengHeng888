# Premium App Store

เว็บแอปพลิเคชันร้านขายแอปพรีเมี่ยม พร้อมระบบ Admin Panel สำหรับจัดการสินค้า

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Mobile-first design (max-width: 480px)

### Backend
- Rust
- Axum (Web Framework)
- PostgreSQL
- sqlx (Database toolkit)

## Project Structure

```
app/
├── frontend/                 # Next.js Frontend
│   ├── app/
│   │   ├── admin/           # Admin Dashboard
│   │   ├── api/             # Next.js API routes (if needed)
│   │   ├── layout.tsx
│   │   └── page.tsx         # Home page
│   ├── components/
│   │   ├── Banner/
│   │   ├── Categories/
│   │   ├── ProductGrid/
│   │   └── Admin/
│   ├── lib/
│   └── types/
│
├── backend/                  # Rust Backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── handlers/
│   │   ├── models/
│   │   ├── database/
│   │   └── routes/
│   ├── migrations/          # Database migrations
│   └── Cargo.toml
│
└── docker-compose.yml       # PostgreSQL setup
```

## Database Schema

ดูรายละเอียดใน `backend/migrations/001_initial_schema.sql`

## Getting Started

### Prerequisites
- Node.js 18+
- Rust 1.70+
- PostgreSQL 14+
- Docker (optional, for PostgreSQL)

### Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### Setup Backend
```bash
cd backend
cargo build
DATABASE_URL=postgresql://user:pass@localhost/premium_appstore cargo run
```

### Database Setup
```bash
# Using Docker
docker-compose up -d

# Run migrations
cd backend
sqlx migrate run
```

## API Endpoints

### Public
- `GET /api/banners` - ดึง Banner ทั้งหมด
- `GET /api/products?category=movie` - ดึงสินค้าตามหมวดหมู่

### Admin
- `POST /api/admin/product` - เพิ่ม/ลบ สินค้า
- `POST /api/admin/banner` - อัปโหลด Banner


