-- AlterTable
ALTER TABLE "public"."applications" ADD COLUMN     "approval_status" TEXT DEFAULT 'none',
ADD COLUMN     "last_agent_action_at" TIMESTAMP(3),
ADD COLUMN     "last_agent_action_by" UUID;

-- CreateIndex
CREATE INDEX "applications_approval_status_idx" ON "public"."applications"("approval_status");
