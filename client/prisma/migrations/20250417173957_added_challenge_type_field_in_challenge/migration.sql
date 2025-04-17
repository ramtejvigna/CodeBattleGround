-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('SYSTEM_DESIGN', 'ALGORITHM', 'DATA_STRUCTURE');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "challengeType" "ChallengeType";
