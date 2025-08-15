-- CreateTable
CREATE TABLE "leads" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "converted_at" DATETIME,
    "user_id" TEXT,
    CONSTRAINT "leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lead_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invite_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "campaign" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_uses" INTEGER,
    "current_uses" INTEGER NOT NULL DEFAULT 0,
    "expires_at" DATETIME,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "link_clicks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "link_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "clicked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "link_clicks_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "invite_links" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "link_clicks_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "funnel_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lead_id" TEXT NOT NULL,
    "step_name" TEXT NOT NULL,
    "step_order" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "time_spent" INTEGER,
    "data" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    CONSTRAINT "funnel_steps_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "onboarding_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "step_name" TEXT NOT NULL,
    "step_order" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "time_spent" INTEGER,
    "data" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    CONSTRAINT "onboarding_steps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_email_key" ON "leads"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invite_links_code_key" ON "invite_links"("code");
