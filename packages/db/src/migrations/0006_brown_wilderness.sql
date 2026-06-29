-- Backfill: set any legacy users still at 'pending' to 'active'
UPDATE "user" SET "status" = 'active' WHERE "status" = 'pending';

-- Backfill: ensure created_at is set for any legacy rows
UPDATE "user" SET "created_at" = COALESCE("created_at", now()) WHERE "created_at" IS NULL;

-- Add CHECK constraint on user.status
ALTER TABLE "user" ADD CONSTRAINT "user_status_check" CHECK ("status" IN ('active', 'pending', 'suspended'));

-- Change is_revoked from text to boolean
ALTER TABLE "user_sessions" ALTER COLUMN "is_revoked" SET DEFAULT false;
ALTER TABLE "user_sessions" ALTER COLUMN "is_revoked" TYPE boolean USING (is_revoked = 'true');
ALTER TABLE "user_sessions" ALTER COLUMN "is_revoked" SET NOT NULL;

-- Add FK constraint on user_sessions.user_id (only if data is clean)
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_user_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;

-- Add unique index on memberships (workspace_id, user_id)
CREATE UNIQUE INDEX IF NOT EXISTS "memberships_workspace_user_unique" ON "memberships" ("workspace_id", "user_id");
