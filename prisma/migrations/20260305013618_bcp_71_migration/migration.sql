/*
  Warnings:

  - You are about to drop the column `comments` on the `Guest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventSignup" ADD COLUMN     "comments" TEXT;

-- AlterTable
ALTER TABLE "Guest" DROP COLUMN "comments";
