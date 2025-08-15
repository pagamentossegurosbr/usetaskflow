-- CreateTable
CREATE TABLE "habit_trackers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "target_count" INTEGER NOT NULL DEFAULT 1,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "habit_trackers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "habit_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habit_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "habit_entries_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habit_trackers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reading_library" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "cover_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'to_read',
    "rating" INTEGER,
    "notes" TEXT,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reading_library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pomodoro_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "task_name" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 1500,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "pomodoro_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cave_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentType" TEXT NOT NULL,
    "fileUrl" TEXT,
    "videoUrl" TEXT,
    "content" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "habit_entries_habit_id_date_key" ON "habit_entries"("habit_id", "date");
