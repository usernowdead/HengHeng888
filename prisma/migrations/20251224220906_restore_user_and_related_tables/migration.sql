-- AlterTable
ALTER TABLE "movies" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "website_settings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
