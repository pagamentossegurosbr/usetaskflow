-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "category" TEXT;
ALTER TABLE "tasks" ADD COLUMN "deadline" DATETIME;
ALTER TABLE "tasks" ADD COLUMN "description" TEXT;
ALTER TABLE "tasks" ADD COLUMN "estimated_time" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "priority_level" TEXT;
ALTER TABLE "tasks" ADD COLUMN "reward" TEXT;
ALTER TABLE "tasks" ADD COLUMN "tags" TEXT;
