-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'movie',
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "website_settings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- CreateIndex
CREATE INDEX "movies_type_idx" ON "movies"("type");
