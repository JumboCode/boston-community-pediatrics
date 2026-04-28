/*
  Warnings:

  - You are about to drop the `SiteContent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SiteContent";

-- DropEnum
DROP TYPE "SiteContentType";

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "r2StorageBytes" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);
