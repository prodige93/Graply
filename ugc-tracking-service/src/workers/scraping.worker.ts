import "dotenv/config";
import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import type { VideoStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { scrapingQueue } from "../queue/scraping.queue";
import { scrapeViews } from "../services/scraper.service";
import { calculatePayout } from "../services/payout.service";
import { getScrapingFrequencyHours } from "../utils/scraping.utils";

export interface ScrapingJobData {
  videoTrackingId: string;
}

const connection = new IORedis({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
});

function nextVideoStatus(payoutStatus: string): VideoStatus {
  switch (payoutStatus) {
    case "pending":
      return "ACTIVE";
    case "eligible":
      return "ACTIVE";
    case "capped":
      return "CAPPED";
    case "budget_exhausted":
      return "BUDGET_EXHAUSTED";
    default:
      return "ACTIVE";
  }
}

export const scrapingWorker = new Worker<ScrapingJobData>(
  "video-scraping",
  async (job: Job<ScrapingJobData>) => {
    const { videoTrackingId } = job.data;

    const video = await prisma.videoTracking.findUnique({
      where: { id: videoTrackingId },
      include: { campaign: true },
    });

    if (!video) {
      console.warn(`[scraping] vidéo introuvable ${videoTrackingId}`);
      return;
    }

    if (video.status !== "ACTIVE") {
      console.log(`[scraping] skip (statut ${video.status}) ${videoTrackingId}`);
      return;
    }

    if (video.campaign.status !== "ACTIVE") {
      await prisma.videoTracking.update({
        where: { id: videoTrackingId },
        data: { status: "BUDGET_EXHAUSTED" },
      });
      return;
    }

    const scrape = await scrapeViews(video.videoUrl, video.platform);
    if (!scrape.success) {
      throw new Error(scrape.error ?? "Scraping échoué");
    }

    const newViews = Math.max(scrape.views, video.currentViews);

    const { nextStatus, shouldSchedule } = await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.findUnique({
        where: { id: video.campaignId },
      });

      if (!campaign || campaign.status !== "ACTIVE") {
        await tx.videoTracking.update({
          where: { id: videoTrackingId },
          data: {
            status: "BUDGET_EXHAUSTED",
            lastScrapedAt: new Date(),
            currentViews: newViews,
          },
        });
        await tx.videoScrapeLog.create({
          data: { videoTrackingId, views: newViews },
        });
        return { nextStatus: "BUDGET_EXHAUSTED" as VideoStatus, shouldSchedule: false };
      }

      if (campaign.remainingBudget <= 0) {
        await tx.campaign.update({
          where: { id: campaign.id },
          data: { status: "BUDGET_EXHAUSTED" },
        });
        await tx.videoTracking.update({
          where: { id: videoTrackingId },
          data: {
            status: "BUDGET_EXHAUSTED",
            lastScrapedAt: new Date(),
            currentViews: newViews,
          },
        });
        await tx.videoScrapeLog.create({
          data: { videoTrackingId, views: newViews },
        });
        return { nextStatus: "BUDGET_EXHAUSTED" as VideoStatus, shouldSchedule: false };
      }

      const payout = calculatePayout(newViews, {
        ratePerKViews: campaign.ratePerKViews,
        minPayment: campaign.minPayment,
        maxPayment: campaign.maxPayment,
        remainingBudget: campaign.remainingBudget,
      });

      const newEarning = payout.earning;
      const deltaBudget = Math.max(0, newEarning - video.currentEarning);
      const freq = getScrapingFrequencyHours(video.createdAt);
      let vs = nextVideoStatus(payout.status);

      await tx.videoTracking.update({
        where: { id: videoTrackingId },
        data: {
          currentViews: newViews,
          currentEarning: newEarning,
          lastScrapedAt: new Date(),
          scrapingFrequencyHours: freq,
          status: vs,
        },
      });

      await tx.videoScrapeLog.create({
        data: {
          videoTrackingId,
          views: newViews,
        },
      });

      if (deltaBudget > 0) {
        const updated = await tx.campaign.update({
          where: { id: campaign.id },
          data: {
            remainingBudget: { decrement: deltaBudget },
          },
        });
        if (updated.remainingBudget <= 0) {
          await tx.campaign.update({
            where: { id: campaign.id },
            data: { status: "BUDGET_EXHAUSTED" },
          });
          if (vs === "ACTIVE") {
            await tx.videoTracking.update({
              where: { id: videoTrackingId },
              data: { status: "BUDGET_EXHAUSTED" },
            });
            vs = "BUDGET_EXHAUSTED";
          }
        }
      }

      const schedule = vs === "ACTIVE";
      return { nextStatus: vs, shouldSchedule: schedule };
    });

    if (!shouldSchedule) {
      console.log(`[scraping] fin surveillance ${videoTrackingId} → ${nextStatus}`);
      return;
    }

    const delayMs = getScrapingFrequencyHours(video.createdAt) * 60 * 60 * 1000;

    await scrapingQueue.add(
      "scrape-video",
      { videoTrackingId },
      { delay: delayMs, jobId: `scrape-${videoTrackingId}-${Date.now()}` },
    );
    console.log(`[scraping] replanifié ${videoTrackingId} dans ${delayMs / 3600000}h`);
  },
  { connection },
);

scrapingWorker.on("failed", (job, err) => {
  console.error(`[scraping] job ${job?.id} failed`, err);
});

console.log("[scraping] worker BullMQ démarré (queue: video-scraping)");
