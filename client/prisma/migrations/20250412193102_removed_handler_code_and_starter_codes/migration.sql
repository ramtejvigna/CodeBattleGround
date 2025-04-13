/*
  Warnings:

  - You are about to drop the column `handlerCode` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `starterCode` on the `Challenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "handlerCode",
DROP COLUMN "starterCode";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActive" TIMESTAMP(3),
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';
