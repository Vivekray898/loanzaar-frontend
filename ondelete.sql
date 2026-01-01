-- DropForeignKey
ALTER TABLE "public"."otp_challenges" DROP CONSTRAINT "otp_challenges_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."auth_sessions" DROP CONSTRAINT "auth_sessions_profile_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."auth_sessions" ADD CONSTRAINT "auth_sessions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."otp_challenges" ADD CONSTRAINT "otp_challenges_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

