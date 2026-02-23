-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "short_urls" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "short_code" VARCHAR(11) NOT NULL,
    "access_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "short_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "short_urls_short_code_unique" ON "short_urls"("short_code");

