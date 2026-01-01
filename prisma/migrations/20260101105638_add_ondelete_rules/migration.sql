-- CreateEnum
CREATE TYPE "public"."application_status_actor_role" AS ENUM ('agent', 'admin');

-- CreateEnum
CREATE TYPE "public"."application_status_action" AS ENUM ('proposed', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('user', 'admin', 'agent');

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "full_name" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT,
    "product_category" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "application_stage" TEXT NOT NULL DEFAULT 'started',
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL DEFAULT 'website',
    "metadata" JSONB DEFAULT '{}',
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "assigned_to" UUID,
    "ip" VARCHAR(64),
    "pincode" TEXT,
    "state" TEXT,
    "user_agent" VARCHAR(512),
    "profile_id" UUID,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "subject" TEXT,
    "status" TEXT DEFAULT 'new',
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "message" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" TEXT,
    "email" TEXT,
    "phone" VARCHAR(24),
    "address" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "role" "public"."user_role" NOT NULL DEFAULT 'user',
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMPTZ(6),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp_challenges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "phone" VARCHAR(24) NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "verify_attempts" INTEGER NOT NULL DEFAULT 0,
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profile_id" UUID,

    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_change_audit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_user_id" UUID NOT NULL,
    "target_user_id" UUID NOT NULL,
    "old_role" "public"."user_role" NOT NULL,
    "new_role" "public"."user_role" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_change_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."application_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "agent_user_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "application_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."application_remarks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "agent_user_id" UUID NOT NULL,
    "remark" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "application_remarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."application_status_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "actor_role" "public"."application_status_actor_role" NOT NULL,
    "action" "public"."application_status_action" NOT NULL,
    "from_status" TEXT NOT NULL,
    "to_status" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auth_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_applications_profile_id" ON "public"."applications"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_profiles_phone_unique" ON "public"."profiles"("phone");

-- CreateIndex
CREATE INDEX "idx_profiles_phone" ON "public"."profiles"("phone");

-- CreateIndex
CREATE INDEX "idx_otp_phone_created_at" ON "public"."otp_challenges"("phone", "created_at");

-- CreateIndex
CREATE INDEX "idx_otp_created_at" ON "public"."otp_challenges"("created_at");

-- CreateIndex
CREATE INDEX "idx_otp_profile_id" ON "public"."otp_challenges"("profile_id");

-- CreateIndex
CREATE INDEX "application_assignments_application_id_idx" ON "public"."application_assignments"("application_id");

-- CreateIndex
CREATE INDEX "application_assignments_agent_user_id_idx" ON "public"."application_assignments"("agent_user_id");

-- CreateIndex
CREATE INDEX "application_remarks_application_id_idx" ON "public"."application_remarks"("application_id");

-- CreateIndex
CREATE INDEX "application_remarks_agent_user_id_idx" ON "public"."application_remarks"("agent_user_id");

-- CreateIndex
CREATE INDEX "application_status_logs_application_id_idx" ON "public"."application_status_logs"("application_id");

-- CreateIndex
CREATE INDEX "application_status_logs_actor_user_id_idx" ON "public"."application_status_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "application_status_logs_created_at_idx" ON "public"."application_status_logs"("created_at");

-- CreateIndex
CREATE INDEX "auth_sessions_created_at_idx" ON "public"."auth_sessions"("created_at");

-- CreateIndex
CREATE INDEX "auth_sessions_profile_id_idx" ON "public"."auth_sessions"("profile_id");

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."otp_challenges" ADD CONSTRAINT "otp_challenges_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."auth_sessions" ADD CONSTRAINT "auth_sessions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
