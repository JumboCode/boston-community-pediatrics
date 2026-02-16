-- DropForeignKey
ALTER TABLE "public"."EventPosition" DROP CONSTRAINT "EventPosition_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventSignup" DROP CONSTRAINT "EventSignup_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventSignup" DROP CONSTRAINT "EventSignup_positionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventSignup" DROP CONSTRAINT "EventSignup_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventWaitlist" DROP CONSTRAINT "EventWaitlist_positionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventWaitlist" DROP CONSTRAINT "EventWaitlist_userId_fkey";

-- AlterTable
ALTER TABLE "EventWaitlist" ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "speaksSpanish" BOOLEAN;

-- AlterTable
ALTER TABLE "WaitlistGuest" ADD COLUMN     "speaksSpanish" BOOLEAN;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "speaksSpanish" BOOLEAN;

-- AddForeignKey
ALTER TABLE "EventSignup" ADD CONSTRAINT "EventSignup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSignup" ADD CONSTRAINT "EventSignup_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "EventPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSignup" ADD CONSTRAINT "EventSignup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPosition" ADD CONSTRAINT "EventPosition_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventWaitlist" ADD CONSTRAINT "EventWaitlist_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "EventPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventWaitlist" ADD CONSTRAINT "EventWaitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "users_clerkId" RENAME TO "users_clerkId_idx";
