import { prisma } from "./prisma";

// 9 GB soft cap — buffer before the 10 GB R2 free tier
const STORAGE_LIMIT_BYTES = BigInt(9 * 1024 * 1024 * 1024);

/**
 * Atomically checks whether adding fileSizeBytes would exceed the limit,
 * and if not, increments the counter. Returns false if over limit.
 */
export async function checkAndIncrementStorage(
  fileSizeBytes: number
): Promise<boolean> {
  try {
    return prisma.$transaction(async (tx) => {
      // Some environments may run with a Prisma client that does not expose
      // AppConfig yet (or before corresponding DB objects exist). In that
      // case, skip quota enforcement instead of breaking signup uploads.
      const appConfig = (tx as unknown as { appConfig?: {
        upsert: (args: {
          where: { id: string };
          create: { id: string; r2StorageBytes: bigint };
          update: Record<string, never>;
        }) => Promise<{ r2StorageBytes: bigint }>;
        update: (args: {
          where: { id: string };
          data: { r2StorageBytes: { increment: bigint } };
        }) => Promise<unknown>;
      } }).appConfig;

      if (!appConfig) {
        return true;
      }

      const config = await appConfig.upsert({
        where: { id: "singleton" },
        create: { id: "singleton", r2StorageBytes: BigInt(0) },
        update: {},
      });

      if (config.r2StorageBytes + BigInt(fileSizeBytes) > STORAGE_LIMIT_BYTES) {
        return false;
      }

      await appConfig.update({
        where: { id: "singleton" },
        data: { r2StorageBytes: { increment: BigInt(fileSizeBytes) } },
      });

      return true;
    });
  } catch (error) {
    console.warn(
      "Storage counter unavailable; allowing upload without quota check.",
      error
    );
    return true;
  }
}
