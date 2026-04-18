-- Tables worker UGC (Graply) — appliqué via : npm run prisma:execute-ugc-sql
-- Idempotent : peut être relancé si les objets existent déjà.

CREATE SCHEMA IF NOT EXISTS "public";

DO $$ BEGIN
  CREATE TYPE "ugc_tracking_campaign_status" AS ENUM ('ACTIVE', 'BUDGET_EXHAUSTED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ugc_video_status" AS ENUM ('ACTIVE', 'CAPPED', 'BUDGET_EXHAUSTED', 'STOPPED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ugc_tracking_platform" AS ENUM ('TIKTOK', 'INSTAGRAM', 'YOUTUBE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ugc_tracking_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ratePerKViews" DOUBLE PRECISION NOT NULL,
    "minPayment" DOUBLE PRECISION NOT NULL,
    "maxPayment" DOUBLE PRECISION NOT NULL,
    "totalBudget" DOUBLE PRECISION NOT NULL,
    "remainingBudget" DOUBLE PRECISION NOT NULL,
    "status" "ugc_tracking_campaign_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ugc_tracking_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ugc_video_tracking" (
    "id" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "platform" "ugc_tracking_platform" NOT NULL,
    "creatorId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" "ugc_video_status" NOT NULL DEFAULT 'ACTIVE',
    "currentViews" INTEGER NOT NULL DEFAULT 0,
    "currentEarning" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scrapingFrequencyHours" INTEGER NOT NULL DEFAULT 2,
    "lastScrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ugc_video_tracking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ugc_video_scrape_logs" (
    "id" TEXT NOT NULL,
    "videoTrackingId" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ugc_video_scrape_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ugc_video_tracking_campaignId_idx" ON "ugc_video_tracking"("campaignId");
CREATE INDEX IF NOT EXISTS "ugc_video_tracking_status_idx" ON "ugc_video_tracking"("status");
CREATE INDEX IF NOT EXISTS "ugc_video_scrape_logs_videoTrackingId_createdAt_idx" ON "ugc_video_scrape_logs"("videoTrackingId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "ugc_video_tracking" ADD CONSTRAINT "ugc_video_tracking_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ugc_tracking_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ugc_video_scrape_logs" ADD CONSTRAINT "ugc_video_scrape_logs_videoTrackingId_fkey" FOREIGN KEY ("videoTrackingId") REFERENCES "ugc_video_tracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
