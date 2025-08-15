-- CreateTable
CREATE TABLE "blog_post_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blog_post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "blog_post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blog_post_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_email" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "blog_post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_likes_post_id_user_id_key" ON "blog_post_likes"("post_id", "user_id");
