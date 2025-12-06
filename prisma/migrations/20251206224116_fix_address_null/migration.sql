/*
  Warnings:

  - You are about to drop the column `address` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `EventPosition` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `EventPosition` table. All the data in the column will be lost.
  - Made the column `city` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zipCode` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "address",
DROP COLUMN "street",
ADD COLUMN     "addressLine1" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "addressLine2" TEXT,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "city" SET DEFAULT '',
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "state" SET DEFAULT '',
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "country" SET DEFAULT '',
ALTER COLUMN "zipCode" SET NOT NULL,
ALTER COLUMN "zipCode" SET DEFAULT '';

-- AlterTable
ALTER TABLE "EventPosition" DROP COLUMN "lat",
DROP COLUMN "lng",
ADD COLUMN     "addressLine1" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "country" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "state" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "zipCode" TEXT NOT NULL DEFAULT '';
