-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('user', 'admin');

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
    "status" TEXT NOT NULL DEFAULT 'new',
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "full_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_profiles_user_id" ON "public"."profiles"("user_id");
