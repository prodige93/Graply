import { scrapingQueue } from "../queue/scraping.queue";
import { prisma } from "../lib/prisma";
import type { Platform } from "@prisma/client";

export async function startVideoTracking(
  videoUrl: string,
  platform: Platform,
  creatorId: string,
  campaignId: string,
): Promise<{ videoTrackingId: string }> {
  const videoTracking = await prisma.videoTracking.create({
    data: {
      videoUrl,
      platform,
      creatorId,
      campaignId,
      status: "ACTIVE",
      scrapingFrequencyHours: 2,
    },
  });

  await scrapingQueue.add(
    "scrape-video",
    { videoTrackingId: videoTracking.id },
    { jobId: `scrape-${videoTracking.id}-0`, delay: 0 },
  );

  return { videoTrackingId: videoTracking.id };
}
