/*
  Warnings:

  - Added the required column `handlerCode` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "handlerCode" JSONB NOT NULL;
