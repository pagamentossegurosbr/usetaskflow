-- CreateTable
CREATE TABLE "tasks" (
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

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");
