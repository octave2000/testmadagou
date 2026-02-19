-- AlterTable
ALTER TABLE "Property"
ADD COLUMN "pricePerNight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Application"
ADD COLUMN "stayDays" INTEGER;
