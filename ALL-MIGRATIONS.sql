-- ============================================
-- ALL MIGRATIONS - Run this in Supabase SQL Editor
-- ============================================
-- Copy this entire file and paste in Supabase SQL Editor
-- Then click "Run" (or Ctrl+Enter)

-- ============================================
-- Migration 1: Create initial tables
-- ============================================

-- CreateTable: users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" INTEGER NOT NULL DEFAULT 0,
    "profile_url" TEXT,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: orders
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "transaction_id" TEXT,
    "state" TEXT NOT NULL DEFAULT 'pending',
    "price" DECIMAL(10,2) NOT NULL,
    "data" TEXT,
    "product_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable: transactions
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balance_before" DECIMAL(10,2) NOT NULL,
    "balance_after" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: qr_sessions
CREATE TABLE IF NOT EXISTS "qr_sessions" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: movies
CREATE TABLE IF NOT EXISTS "movies" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'movie',
    "platform" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable: website_settings
CREATE TABLE IF NOT EXISTS "website_settings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "updated_by" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_settings_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Create Indexes
-- ============================================

-- Users indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Orders indexes
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "orders_state_idx" ON "orders"("state");
CREATE INDEX IF NOT EXISTS "orders_type_idx" ON "orders"("type");
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders"("created_at");

-- Transactions indexes
CREATE INDEX IF NOT EXISTS "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX IF NOT EXISTS "transactions_order_id_idx" ON "transactions"("order_id");
CREATE INDEX IF NOT EXISTS "transactions_type_idx" ON "transactions"("type");
CREATE INDEX IF NOT EXISTS "transactions_created_at_idx" ON "transactions"("created_at");

-- QR Sessions indexes
CREATE UNIQUE INDEX IF NOT EXISTS "qr_sessions_session_id_key" ON "qr_sessions"("session_id");
CREATE INDEX IF NOT EXISTS "qr_sessions_session_id_idx" ON "qr_sessions"("session_id");
CREATE INDEX IF NOT EXISTS "qr_sessions_status_idx" ON "qr_sessions"("status");
CREATE INDEX IF NOT EXISTS "qr_sessions_expires_at_idx" ON "qr_sessions"("expires_at");

-- Movies indexes
CREATE INDEX IF NOT EXISTS "movies_order_idx" ON "movies"("order");
CREATE INDEX IF NOT EXISTS "movies_type_idx" ON "movies"("type");

-- Website Settings indexes
CREATE UNIQUE INDEX IF NOT EXISTS "website_settings_key_key" ON "website_settings"("key");
CREATE INDEX IF NOT EXISTS "website_settings_key_idx" ON "website_settings"("key");
CREATE INDEX IF NOT EXISTS "website_settings_category_idx" ON "website_settings"("category");

-- ============================================
-- Add Foreign Keys
-- ============================================

-- Orders foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_user_id_fkey'
    ) THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Transactions foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transactions_user_id_fkey'
    ) THEN
        ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transactions_order_id_fkey'
    ) THEN
        ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_fkey" 
        FOREIGN KEY ("order_id") REFERENCES "orders"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================
-- Done! Check tables in Table Editor
-- ============================================

