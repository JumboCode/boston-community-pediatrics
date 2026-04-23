-- CreateEnum
CREATE TYPE "SiteContentType" AS ENUM ('IMAGE', 'TEXT');

-- CreateTable
CREATE TABLE "SiteContent" (
    "key" TEXT NOT NULL,
    "type" "SiteContentType" NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("key")
);
