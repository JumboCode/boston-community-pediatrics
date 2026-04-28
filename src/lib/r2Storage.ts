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
  return prisma.$transaction(async (tx) => {
    const config = await tx.appConfig.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", r2StorageBytes: BigInt(0) },
      update: {},
    });

    if (config.r2StorageBytes + BigInt(fileSizeBytes) > STORAGE_LIMIT_BYTES) {
      return false;
    }

    await tx.appConfig.update({
      where: { id: "singleton" },
      data: { r2StorageBytes: { increment: BigInt(fileSizeBytes) } },
    });

    return true;
  });
}
