/*
  Warnings:

  - Changed the type of `provider` on the `Bucket` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Bucket" DROP COLUMN "provider",
ADD COLUMN     "provider" TEXT NOT NULL,
ALTER COLUMN "format" DROP NOT NULL;
