-- CreateEnum
CREATE TYPE "ListingLabel" AS ENUM ('Monthly', 'Night', 'Sell');

-- AlterTable
ALTER TABLE "Property"
ADD COLUMN "listingLabel" "ListingLabel";

-- Backfill existing properties based on available pricing fields
UPDATE "Property"
SET "listingLabel" = CASE
  WHEN "pricePerNight" IS NOT NULL THEN 'Night'::"ListingLabel"
  WHEN "pricePerMonth" IS NOT NULL THEN 'Monthly'::"ListingLabel"
  WHEN "priceTotal" IS NOT NULL THEN 'Sell'::"ListingLabel"
  ELSE 'Monthly'::"ListingLabel"
END
WHERE "listingLabel" IS NULL;

-- Enforce and default for new records
ALTER TABLE "Property"
ALTER COLUMN "listingLabel" SET NOT NULL,
ALTER COLUMN "listingLabel" SET DEFAULT 'Monthly';
