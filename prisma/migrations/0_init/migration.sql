-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "short_urls" (
    "short_url_id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "short_code" VARCHAR(11) NOT NULL,

    CONSTRAINT "short_pkey" PRIMARY KEY ("short_url_id")
);

-- CreateTable
CREATE TABLE "clicks" (
    "click_id" SERIAL NOT NULL,
    "short_url_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "country" VARCHAR(100),
    "region" VARCHAR(50),
    "timezone" VARCHAR(100),
    "browser_name" VARCHAR(50),
    "browser_version" VARCHAR(50),
    "browser_version_major" VARCHAR(10),
    "os" VARCHAR(50),
    "os_version" VARCHAR(10),
    "device_type" VARCHAR(100),
    "device_vendor" VARCHAR(100),
    "device_model" VARCHAR(100),
    "city" VARCHAR(100),

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("click_id","short_url_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "short_urls_short_code_unique" ON "short_urls"("short_code");

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "fk_clicks_short_urls" FOREIGN KEY ("short_url_id") REFERENCES "short_urls"("short_url_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

