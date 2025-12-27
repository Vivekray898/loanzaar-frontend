-- AlterTable
ALTER TABLE "public"."contact_messages" ADD COLUMN     "ip" VARCHAR(64),
ADD COLUMN     "user_agent" VARCHAR(512);
