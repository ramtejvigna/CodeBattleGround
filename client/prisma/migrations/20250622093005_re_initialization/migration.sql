/*
  Warnings:

  - Changed the type of `type` on the `Activity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CHALLENGE', 'CONTEST', 'BADGE', 'DISCUSSION');

-- Step 1: Add a temporary column with the new enum type
ALTER TABLE "Activity" ADD COLUMN "type_new" "ActivityType";

-- Step 2: Update existing data - map existing string values to enum values
-- This assumes your existing data contains values that match the enum
-- Adjust the mappings below based on your actual data
UPDATE "Activity" SET "type_new" = 
  CASE 
    WHEN "type" ILIKE 'challenge' THEN 'CHALLENGE'::"ActivityType"
    WHEN "type" ILIKE 'contest' THEN 'CONTEST'::"ActivityType"
    WHEN "type" ILIKE 'badge' THEN 'BADGE'::"ActivityType"
    WHEN "type" ILIKE 'discussion' THEN 'DISCUSSION'::"ActivityType"
    -- Default fallback - adjust as needed
    ELSE 'CHALLENGE'::"ActivityType"
  END;

-- Step 3: Make the new column NOT NULL (after data migration)
ALTER TABLE "Activity" ALTER COLUMN "type_new" SET NOT NULL;

-- Step 4: Drop the old column
ALTER TABLE "Activity" DROP COLUMN "type";

-- Step 5: Rename the new column to the original name
ALTER TABLE "Activity" RENAME COLUMN "type_new" TO "type";
