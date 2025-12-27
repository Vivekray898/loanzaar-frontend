/*
  Warnings:

  - Added the required column `message` to the `contact_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."contact_messages" ADD COLUMN     "message" TEXT NOT NULL;
