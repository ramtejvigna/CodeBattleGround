/*
  Warnings:

  - Added the required column `rank` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solved` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "badges" TEXT[],
ADD COLUMN     "rank" INTEGER NOT NULL,
ADD COLUMN     "solved" INTEGER NOT NULL;
