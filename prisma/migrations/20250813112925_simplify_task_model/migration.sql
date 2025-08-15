/*
  Warnings:

  - You are about to drop the column `category` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `checklist` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_time` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `links` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `priority_level` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `recurrence` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `reward` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `tasks` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "completed_at" DATETIME,
    "scheduled_for" DATETIME,
    CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("completed", "completed_at", "created_at", "id", "priority", "scheduled_for", "text", "title", "updated_at", "user_id") SELECT "completed", "completed_at", "created_at", "id", "priority", "scheduled_for", "text", "title", "updated_at", "user_id" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
