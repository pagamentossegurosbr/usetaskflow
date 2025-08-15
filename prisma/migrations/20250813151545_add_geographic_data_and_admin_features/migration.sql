/*
  Warnings:

  - You are about to drop the column `content` on the `cave_content` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `cave_content` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `cave_content` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `cave_content` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `cave_content` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `cave_content` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `cave_content` table. All the data in the column will be lost.
  - Added the required column `type` to the `cave_content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `cave_content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "leads" ADD COLUMN "city" TEXT;
ALTER TABLE "leads" ADD COLUMN "country" TEXT;
ALTER TABLE "leads" ADD COLUMN "region" TEXT;
ALTER TABLE "leads" ADD COLUMN "timezone" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "city" TEXT;
ALTER TABLE "users" ADD COLUMN "country" TEXT;
ALTER TABLE "users" ADD COLUMN "ip_address" TEXT;
ALTER TABLE "users" ADD COLUMN "region" TEXT;
ALTER TABLE "users" ADD COLUMN "timezone" TEXT;

-- CreateTable
CREATE TABLE "xp_levels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL,
    "xp_required" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "badge" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featured_image" TEXT,
    "category" TEXT,
    "tags" JSONB,
    "author_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" DATETIME,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cave_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "url" TEXT,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_cave_content" ("description", "id", "order", "title") SELECT "description", "id", "order", "title" FROM "cave_content";
DROP TABLE "cave_content";
ALTER TABLE "new_cave_content" RENAME TO "cave_content";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "xp_levels_level_key" ON "xp_levels"("level");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");
