-- Create role_change_audit table
-- Tracks actor (who made the change), target user, old/new role and timestamp

-- CreateTable
CREATE TABLE "public"."role_change_audit" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "actor_user_id" uuid NOT NULL,
  "target_user_id" uuid NOT NULL,
  "old_role" "public"."user_role" NOT NULL,
  "new_role" "public"."user_role" NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Index actor & target for faster lookups
CREATE INDEX "idx_role_change_audit_actor_user_id" ON "public"."role_change_audit" ("actor_user_id");
CREATE INDEX "idx_role_change_audit_target_user_id" ON "public"."role_change_audit" ("target_user_id");
