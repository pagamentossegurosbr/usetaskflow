/*
  Warnings:

  - You are about to drop the column `city` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `xp_levels` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "source" TEXT NOT NULL,
    "campaign" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "onboardingData" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "converted_at" DATETIME,
    "user_id" TEXT,
    CONSTRAINT "leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_leads" ("campaign", "converted_at", "created_at", "email", "id", "ip_address", "name", "notes", "onboardingData", "phone", "referrer", "score", "source", "status", "tags", "updated_at", "user_agent", "user_id", "utm_campaign", "utm_content", "utm_medium", "utm_source", "utm_term") SELECT "campaign", "converted_at", "created_at", "email", "id", "ip_address", "name", "notes", "onboardingData", "phone", "referrer", "score", "source", "status", "tags", "updated_at", "user_agent", "user_id", "utm_campaign", "utm_content", "utm_medium", "utm_source", "utm_term" FROM "leads";
DROP TABLE "leads";
ALTER TABLE "new_leads" RENAME TO "leads";
CREATE UNIQUE INDEX "leads_email_key" ON "leads"("email");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "title" TEXT,
    "badges" TEXT NOT NULL DEFAULT '',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "hide_profile_effects" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "banned_at" DATETIME,
    "banned_by" TEXT,
    "ban_reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" DATETIME,
    "avatar" TEXT,
    "date_of_birth" DATETIME,
    "date_of_birth_change_count" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'pt',
    "subscription_plan" TEXT NOT NULL DEFAULT 'free',
    "subscription_status" TEXT NOT NULL DEFAULT 'active',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "subscription_started_at" DATETIME,
    "subscription_expires_at" DATETIME,
    "max_level" INTEGER NOT NULL DEFAULT 3,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "badges", "ban_reason", "banned_at", "banned_by", "bio", "created_at", "date_of_birth", "date_of_birth_change_count", "email", "emailVerified", "hide_profile_effects", "id", "image", "is_active", "is_banned", "last_login_at", "level", "max_level", "name", "password", "role", "stripe_customer_id", "stripe_subscription_id", "subscription_expires_at", "subscription_plan", "subscription_started_at", "subscription_status", "theme", "title", "updated_at", "xp") SELECT "avatar", "badges", "ban_reason", "banned_at", "banned_by", "bio", "created_at", "date_of_birth", "date_of_birth_change_count", "email", "emailVerified", "hide_profile_effects", "id", "image", "is_active", "is_banned", "last_login_at", "level", "max_level", "name", "password", "role", "stripe_customer_id", "stripe_subscription_id", "subscription_expires_at", "subscription_plan", "subscription_started_at", "subscription_status", "theme", "title", "updated_at", "xp" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE TABLE "new_xp_levels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL,
    "xp_required" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "badge" TEXT,
    "color" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_xp_levels" ("badge", "color", "created_at", "description", "id", "level", "title", "updated_at", "xp_required") SELECT "badge", "color", "created_at", "description", "id", "level", "title", "updated_at", "xp_required" FROM "xp_levels";
DROP TABLE "xp_levels";
ALTER TABLE "new_xp_levels" RENAME TO "xp_levels";
CREATE UNIQUE INDEX "xp_levels_level_key" ON "xp_levels"("level");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
