/*
  Warnings:

  - You are about to drop the column `metadata` on the `contact_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contact_messages" DROP COLUMN "metadata",
ADD COLUMN     "reason" TEXT;
