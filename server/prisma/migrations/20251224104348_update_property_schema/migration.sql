-- AlterEnum
ALTER TYPE "PropertyType" ADD VALUE 'Commercial';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "priceTotal" DOUBLE PRECISION,
ALTER COLUMN "pricePerMonth" DROP NOT NULL;
