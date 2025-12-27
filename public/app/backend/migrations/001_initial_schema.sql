-- Premium App Store Database Schema

-- Banners table
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    link_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    platform TEXT, -- e.g., 'iOS', 'Android', 'Windows', 'Web'
    version TEXT,
    is_premium BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_banners_active_order ON banners(is_active, display_order);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Insert default categories
INSERT INTO categories (name, slug, description, display_order) VALUES
    ('แอพดูหนัง', 'movie', 'แอปพลิเคชันดูหนังและซีรี่ส์', 1),
    ('เติมเงิน', 'top-up', 'บริการเติมเงินเกมและแอปพลิเคชัน', 2),
    ('แอปพลิเคชัน', 'apps', 'แอปพลิเคชันต่างๆ', 3),
    ('เกมส์', 'games', 'เกมส์พรีเมี่ยม', 4);

-- Sample banners (optional)
INSERT INTO banners (image_url, title, description, display_order) VALUES
    ('/banners/banner1.jpg', 'โปรโมชั่นพิเศษ', 'ส่วนลดสูงสุด 50%', 1),
    ('/banners/banner2.jpg', 'แอพดูหนังใหม่', 'ดูหนังล่าสุดก่อนใคร', 2);

