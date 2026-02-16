-- AlterTable
ALTER TABLE "EventWaitlist" ADD COLUMN "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN "comments" TEXT;
ALTER TABLE "Guest" ADD COLUMN "dateOfBirth" TEXT;

-- AlterTable
ALTER TABLE "WaitlistGuest" ADD COLUMN "comments" TEXT;
ALTER TABLE "WaitlistGuest" ADD COLUMN "dateOfBirth" TEXT;

-- AlterIndex
DROP INDEX IF EXISTS "users_clerkId_key";
CREATE INDEX "users_clerkId" ON "users"("clerkId");