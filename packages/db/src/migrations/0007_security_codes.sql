CREATE TABLE IF NOT EXISTS "security_codes" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "code_hash" text NOT NULL,
  "code_prefix" text NOT NULL,
  "used_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now()
);
