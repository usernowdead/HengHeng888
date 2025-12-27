# โครงสร้างโปรเจกต์ Premium App Store

## โครงสร้างโฟลเดอร์

```
app/
├── frontend/                          # Next.js Frontend Application
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx              # Admin Dashboard Page
│   │   ├── layout.tsx                # Root Layout
│   │   ├── page.tsx                  # Home Page (หน้าแรก)
│   │   └── globals.css               # Global Styles
│   ├── components/
│   │   ├── Banner/
│   │   │   └── BannerSlider.tsx      # Banner Carousel Component
│   │   ├── Categories/
│   │   │   └── Categories.tsx        # Category Navigation Component
│   │   └── ProductGrid/
│   │       └── ProductGrid.tsx       # Product Grid Component
│   ├── lib/
│   │   └── api.ts                    # API Client Functions
│   ├── public/                       # Static Assets
│   ├── package.json                  # Frontend Dependencies
│   ├── tsconfig.json                 # TypeScript Configuration
│   ├── tailwind.config.ts            # Tailwind CSS Configuration
│   ├── postcss.config.js             # PostCSS Configuration
│   └── next.config.js                # Next.js Configuration
│
├── backend/                          # Rust Backend Application
│   ├── src/
│   │   ├── main.rs                   # Application Entry Point
│   │   ├── handlers/                 # Request Handlers
│   │   │   ├── mod.rs
│   │   │   ├── banners.rs            # Banner API Handlers
│   │   │   ├── products.rs           # Product API Handlers
│   │   │   ├── categories.rs         # Category API Handlers
│   │   │   └── admin.rs              # Admin API Handlers
│   │   ├── models/                   # Data Models
│   │   │   ├── mod.rs
│   │   │   ├── banner.rs             # Banner Model
│   │   │   ├── category.rs           # Category Model
│   │   │   └── product.rs            # Product Model
│   │   ├── routes/                   # Route Definitions
│   │   │   └── mod.rs
│   │   └── database/                 # Database Utilities
│   │       └── mod.rs
│   ├── migrations/                   # Database Migrations
│   │   └── 001_initial_schema.sql    # Initial Database Schema
│   ├── Cargo.toml                    # Rust Dependencies
│   └── .env.example                  # Environment Variables Template
│
├── docker-compose.yml                # PostgreSQL Docker Setup
├── README.md                         # Project Overview
├── SETUP_GUIDE.md                    # Installation Guide
└── .gitignore                        # Git Ignore Rules
```

## Database Schema

### Tables

1. **banners** - เก็บข้อมูล Banner สำหรับแสดงในหน้าแรก
2. **categories** - เก็บหมวดหมู่สินค้า
3. **products** - เก็บข้อมูลสินค้า

รายละเอียดอยู่ใน `backend/migrations/001_initial_schema.sql`

## Frontend Architecture

### Design Principles
- **Mobile-first**: ออกแบบสำหรับมือถือก่อน
- **Max-width: 480px**: Container จำกัดความกว้างสูงสุด 480px
- **Centered Layout**: จัดกึ่งกลางหน้าจอ
- **Dark Background**: พื้นหลังนอก Container เป็นสีเทา

### Components

1. **BannerSlider**
   - ใช้ Swiper.js สำหรับ Carousel
   - Auto-play ทุก 3 วินาที
   - รองรับ Pagination

2. **Categories**
   - แสดงหมวดหมู่หลัก 4 หมวด
   - มี Icon และชื่อไทย
   - Click เพื่อกรองสินค้า

3. **ProductGrid**
   - Grid Layout 2 คอลัมน์
   - แสดงรูปภาพ, ชื่อ, ราคา
   - Badge สำหรับ Premium Products

### Pages

1. **Home Page** (`/`)
   - Banner Slider
   - Categories
   - Product Grid

2. **Admin Dashboard** (`/admin`)
   - จัดการสินค้า (เพิ่ม/ลบ)
   - จัดการ Banner (เพิ่ม)
   - แบ่ง Tab สำหรับแต่ละฟีเจอร์

## Backend Architecture

### Tech Stack
- **Framework**: Axum 0.7
- **Database**: PostgreSQL with sqlx
- **Async Runtime**: Tokio

### API Endpoints

#### Public APIs
- `GET /api/banners` - ดึง Banner ทั้งหมด
- `GET /api/categories` - ดึง Categories ทั้งหมด
- `GET /api/products?category=movie` - ดึงสินค้าตามหมวดหมู่

#### Admin APIs
- `POST /api/admin/product` - เพิ่มสินค้า
- `POST /api/admin/product/delete` - ลบสินค้า
- `POST /api/admin/banner` - เพิ่ม Banner

### Error Handling
- ใช้ `anyhow::Result` สำหรับ error handling
- Logging ด้วย `tracing`
- Return appropriate HTTP status codes

## Development Workflow

1. **Start Database**: `docker-compose up -d`
2. **Run Migrations**: `cd backend && sqlx migrate run`
3. **Start Backend**: `cd backend && cargo run`
4. **Start Frontend**: `cd frontend && npm run dev`

## Next Steps (Future Enhancements)

- [ ] Authentication & Authorization สำหรับ Admin
- [ ] File Upload สำหรับรูปภาพ (แทน URL)
- [ ] Product Search & Filter
- [ ] Shopping Cart & Checkout
- [ ] Payment Integration
- [ ] User Accounts
- [ ] Product Reviews & Ratings
- [ ] Admin Analytics Dashboard


