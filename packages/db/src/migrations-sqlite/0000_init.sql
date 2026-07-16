CREATE TABLE IF NOT EXISTS user (
  id text PRIMARY KEY NOT NULL,
  name text,
  email text UNIQUE,
  emailVerified text,
  image text,
  password text,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('active', 'pending', 'suspended')),
  theme text DEFAULT 'system',
  density text DEFAULT 'comfortable',
  created_at text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS session (
  sessionToken text PRIMARY KEY NOT NULL,
  userId text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  expires text NOT NULL
);

CREATE TABLE IF NOT EXISTS account (
  userId text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  providerAccountId text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at text,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  PRIMARY KEY (provider, providerAccountId)
);

CREATE TABLE IF NOT EXISTS verificationToken (
  identifier text NOT NULL,
  token text NOT NULL,
  expires text NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS workspaces (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  settings text DEFAULT '{}',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL,
  user_id text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at text NOT NULL,
  updated_at text NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS memberships_workspace_user_unique ON memberships(workspace_id, user_id);

CREATE TABLE IF NOT EXISTS agents (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL,
  name text NOT NULL,
  description text,
  system_prompt text,
  knowledge_instructions text,
  status text NOT NULL DEFAULT 'draft',
  provider_config text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS channels (
  id text PRIMARY KEY NOT NULL,
  agent_id text NOT NULL,
  type text NOT NULL DEFAULT 'widget',
  name text NOT NULL,
  config text DEFAULT '{}',
  is_active text NOT NULL DEFAULT 'true',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id text PRIMARY KEY NOT NULL,
  channel_id text NOT NULL,
  external_user_id text,
  status text NOT NULL DEFAULT 'active',
  is_test integer NOT NULL DEFAULT 0,
  metadata text DEFAULT '{}',
  message_count integer NOT NULL DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY NOT NULL,
  conversation_id text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  tool_calls text,
  tool_results text,
  tokens_in integer,
  tokens_out integer,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL,
  source_type text NOT NULL,
  source_url text,
  title text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  metadata text DEFAULT '{}',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id text PRIMARY KEY NOT NULL,
  document_id text NOT NULL,
  content text NOT NULL,
  chunk_index integer NOT NULL,
  embedding text,
  metadata text DEFAULT '{}',
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  scopes text NOT NULL,
  expires_at text,
  last_used_at text,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  provider_subscription_id text,
  period_start text,
  period_end text,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL,
  event_type text NOT NULL,
  payload text DEFAULT '{}',
  timestamp text NOT NULL
);

CREATE TABLE IF NOT EXISTS invitations (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by_user_id text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  token text NOT NULL UNIQUE,
  expires_at text NOT NULL,
  accepted_at text,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invitations_workspace_email ON invitations(workspace_id, email);

CREATE TABLE IF NOT EXISTS user_sessions (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  device_name text,
  device_type text,
  browser text,
  os text,
  ip_address text,
  location text,
  is_revoked integer NOT NULL DEFAULT 0,
  last_active_at text NOT NULL,
  created_at text NOT NULL,
  expires_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS security_codes (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  code_prefix text NOT NULL,
  used_at text,
  created_at text NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE workspaces ADD COLUMN description text;
ALTER TABLE workspaces ADD COLUMN timezone text DEFAULT 'UTC';
ALTER TABLE workspaces ADD COLUMN deleted_at text;

CREATE TABLE IF NOT EXISTS agent_documents (
  id text PRIMARY KEY NOT NULL,
  agent_id text NOT NULL,
  document_id text NOT NULL,
  created_at text NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS agent_documents_agent_document_unique ON agent_documents(agent_id, document_id);
