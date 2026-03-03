-- DropForeignKey
ALTER TABLE "Guest" DROP CONSTRAINT "Guest_signupId_fkey";

-- DropForeignKey
ALTER TABLE "WaitlistGuest" DROP CONSTRAINT "WaitlistGuest_waitlistId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "imagesDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_signupId_fkey" FOREIGN KEY ("signupId") REFERENCES "EventSignup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistGuest" ADD CONSTRAINT "WaitlistGuest_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "EventWaitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
