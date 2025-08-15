/*
  Warnings:

  - You are about to drop the column `estimated_time` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `priority_level` on the `tasks` table. All the data in the column will be lost.
  - You are about to alter the column `tags` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

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
    "description" TEXT,
    "category" TEXT,
    "deadline" DATETIME,
    "estimatedTime" INTEGER,
    "tags" JSONB,
    "reward" TEXT,
    CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("category", "completed", "completed_at", "created_at", "deadline", "description", "id", "priority", "reward", "scheduled_for", "tags", "text", "title", "updated_at", "user_id") SELECT "category", "completed", "completed_at", "created_at", "deadline", "description", "id", "priority", "reward", "scheduled_for", "tags", "text", "title", "updated_at", "user_id" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
