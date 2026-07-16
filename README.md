# ChasteAI

<p align="center">
  <img src="apps/web/public/logo.png" alt="ChasteAI" width="120" />
</p>

**Open-source AI customer support infrastructure.** Self-host everything locally with zero external dependencies.

- **AI agents** that answer customer questions via chat
- **Multi-channel** (web widget, API, etc.)
- **Document ingestion** with RAG (retrieval-augmented generation)
- **Agent knowledge management** — assign documents to specific agents, custom knowledge instructions
- **Analytics** across conversations, agents, and channels
- **Security codes** — recovery codes for password reset without email
- **Test conversations** — preview mode for testing agents without polluting analytics
- **API keys** for external integrations
- **Bring your own LLM** — any OpenAI-compatible API works (OpenAI, Groq, Together, LiteLLM, etc.)

---

## What you'll see

| URL                                                   | What's there                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `http://localhost:3000`                               | Landing / homepage                                               |
| `http://localhost:3000/signin`                        | Sign in form (password or security code)                         |
| `http://localhost:3000/signup`                        | Sign up form                                                     |
| `http://localhost:3000/dashboard`                     | Dashboard with stats (agents, conversations, channels, messages) |
| `http://localhost:3000/dashboard/agents`              | List your AI agents (clickable cards, copy embed, preview)       |
| `http://localhost:3000/dashboard/agents/new`          | Create a new agent                                               |
| `http://localhost:3000/dashboard/agents/[id]/preview` | Test agent in mock widget (no real conversations created)        |
| `http://localhost:3000/dashboard/documents`           | Uploaded documents                                               |
| `http://localhost:3000/dashboard/api-keys`            | API keys for integrations                                        |
| `http://localhost:3000/dashboard/analytics`           | Conversation analytics (test conversations excluded)             |
| `http://localhost:3000/widget/channel/{id}`           | Embedded chat widget                                             |
| `http://localhost:3000/widget/embed.js`               | Widget JavaScript bundle                                         |
| `http://localhost:3000/api/trpc/health.ping`          | Health check (public)                                            |
| `http://localhost:4983`                               | Drizzle Studio (database browser)                                |

### Seed account

| Field    | Value                |
| -------- | -------------------- |
| Email    | `admin@chasteai.dev` |
| Password | `password123`        |

---

## Quick start

```sh
pnpm setup      # auto: env, deps, build, database
pnpm dev        # start dev server at http://localhost:3000
```

Sign in with `admin@chasteai.dev` / `password123`.

---

## AI providers — config-driven, no code needed

Any OpenAI-compatible API works. You only need three things:

```
apiKey + baseUrl + model
```

Set them in `apps/web/.env`:

```env
# Built-in shortcuts (set the key, provider auto-detects)
OPENAI_API_KEY="sk-..."                          # OpenAI
GROQ_API_KEY="gsk_..."                            # Groq (free tier)
# ANTHROPIC_API_KEY="sk-ant-..."

# Or configure any custom provider in the agent form:
# Provider: "OpenAI Compatible"
# API Key:  your-key
# Base URL: https://your-api.com/v1
# Model:    your-model-name
```

When creating an agent in the dashboard:

| If you select         | You need                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **OpenAI**            | `OPENAI_API_KEY` in env, model like `gpt-4o`                                                            |
| **OpenAI Compatible** | Any `apiKey` + `baseUrl` + `model` — works with Groq, Together, LiteLLM, vLLM, Ollama (via proxy), etc. |

No code changes. No new provider files. Just config.

### Providers config file

For teams that want to pre-define providers, create `providers.json` in the project root:

```json
[
  {
    "name": "OpenAI GPT-4o",
    "type": "openai-compatible",
    "apiKey": "sk-...",
    "baseUrl": "https://api.openai.com/v1",
    "defaultModel": "gpt-4o"
  },
  {
    "name": "Groq Llama 3",
    "type": "openai-compatible",
    "apiKey": "gsk_...",
    "baseUrl": "https://api.groq.com/openai/v1",
    "defaultModel": "llama-3.3-70b-versatile"
  },
  {
    "name": "Local Ollama",
    "type": "openai-compatible",
    "baseUrl": "http://localhost:11434/v1",
    "defaultModel": "llama3"
  }
]
```

(Coming soon — the agent form will load providers from this file.)

---

## Step-by-step setup

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10
- **PostgreSQL** >= 14

### 1. Clone and install

```sh
git clone <repo-url> chasteai
cd chasteai
pnpm install
```

### 2. Configure environment

```sh
cp .env.example apps/web/.env
```

Edit `apps/web/.env` and set:

```env
DATABASE_URL="postgres://postgres:password@localhost:5432/chasteai"
AUTH_SECRET="generate-a-random-secret-here"
GROQ_API_KEY="gsk_..."    # free tier, no credit card needed
```

> Get a free Groq API key at https://console.groq.com — no credit card required.

### 3. Set up the database

```sh
createdb chasteai           # Create the database
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed with dev data
```

### 4. Start developing

```sh
pnpm dev
```

Open `http://localhost:3000` and sign in with `admin@chasteai.dev` / `password123`.

---

## Docker (optional)

```sh
docker compose up -d
```

Starts PostgreSQL (with pgvector), Redis, MinIO (S3), and Ollama (local LLM).

---

## Commands

```sh
pnpm dev              # Start all dev servers
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm turbo typecheck  # Type-check all packages

# Database
pnpm db:generate      # Generate migration from schema changes
pnpm db:migrate       # Apply pending migrations
pnpm db:seed          # Seed dev data
pnpm db:studio        # Drizzle Studio (db browser at :4983)

# Browser testing (uses agent-browser CLI)
pnpm test:browser:install  # Install Chromium (first time)
pnpm test:browser           # Open homepage and inspect
pnpm test:browser:auth      # Sign in with seed account and inspect

# Other
pnpm adr:create       # Create an Architecture Decision Record
pnpm format           # Format all files
pnpm clean            # Remove build artifacts
```

---

## Testing with agent-browser

Tests use [agent-browser](https://github.com/anthropics/agent-browser) — a CLI tool for AI-driven browser automation.

Install it:

```sh
npm install -g agent-browser
agent-browser install       # Downloads Chromium
```

Then navigate your app:

```sh
# Open the sign-in page and inspect the accessibility tree
agent-browser open http://localhost:3000/signin
agent-browser snapshot -i   # Interactive elements only

# Sign in with seed account
agent-browser open http://localhost:3000/signin
agent-browser fill @e1 "admin@chasteai.dev"   # Email field
agent-browser fill @e2 "password123"           # Password field
agent-browser click @e3                         # Submit button
agent-browser snapshot

# Check the dashboard loads
agent-browser open http://localhost:3000/dashboard
agent-browser snapshot

# Test the health endpoint
curl http://localhost:3000/api/trpc/health.ping
```

The `@e1`, `@e2` references come from the snapshot output — they change based on the page structure.

---

## Project structure

```
chasteai/
├── apps/web/                  # Next.js app (auth, dashboard, API, widget)
│   ├── src/app/               # Pages, API routes, layouts
│   ├── src/server/api/        # tRPC routers (agent, agentKnowledge, conversation, etc.)
│   └── src/lib/actions/       # Server actions (auth, setup, admin)
├── packages/
│   ├── ai/                    # AI provider abstraction + registry
│   │   └── src/providers/     # openai-compatible (single provider, config-driven)
│   ├── db/                    # Drizzle schema, migrations, seed
│   ├── rag/                   # RAG: chunking, embeddings, retrieval, crawler
│   ├── analytics/             # Analytics queries (excludes test conversations)
│   ├── channels/              # Channel provider abstraction
│   └── ...                    # typescript-config, eslint-config, prettier-config
├── scripts/                   # Setup, ADR management, hooks
├── docs/                      # ADRs, PRD, design system
├── providers.json.example     # Example provider config file
└── docker-compose.yml         # PostgreSQL, Redis, MinIO, Ollama
```

---

## Configuration

### Environment variables

See `.env.example` for the full list. Core ones:

```
DATABASE_URL        PostgreSQL connection string
AUTH_SECRET         Auth.js secret (generate with `openssl rand -base64 32`)
OPENAI_API_KEY      OpenAI API key
GROQ_API_KEY        Groq API key (free, OpenAI-compatible)
ANTHROPIC_API_KEY   Anthropic API key
AUTH_GITHUB_*       GitHub OAuth credentials
AUTH_GOOGLE_*       Google OAuth credentials
```

### AI providers

The provider system is entirely config-driven. There's one provider type — `openai-compatible` — that works with any API that speaks the OpenAI chat completions format.

| API                   | baseUrl                          | How to configure                                                           |
| --------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| OpenAI                | `https://api.openai.com/v1`      | Set `OPENAI_API_KEY` env var, select "OpenAI" in form                      |
| Groq                  | `https://api.groq.com/openai/v1` | Set `GROQ_API_KEY` env var, or use "OpenAI Compatible" with custom baseUrl |
| Together AI           | `https://api.together.xyz/v1`    | "OpenAI Compatible" with your key                                          |
| LiteLLM               | `http://localhost:4000/v1`       | "OpenAI Compatible" with your key                                          |
| Ollama (via proxy)    | `http://localhost:11434/v1`      | "OpenAI Compatible" (no key needed for local)                              |
| vLLM                  | `http://localhost:8000/v1`       | "OpenAI Compatible" with your key                                          |
| Any OpenAI-compatible | your URL                         | "OpenAI Compatible" in the agent form                                      |

---

## API (tRPC)

| Router           | Procedures                                                                                                  | Auth      |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | --------- |
| `health`         | `ping`                                                                                                      | Public    |
| `workspace`      | `list`, `getBySlug`, `create`, `update`, `delete`                                                           | Protected |
| `agent`          | `list`, `getById`, `create`, `update`, `delete`                                                             | Protected |
| `agentKnowledge` | `getAssignedDocuments`, `getWorkspaceDocuments`, `assignDocument`, `unassignDocument`, `updateInstructions` | Protected |
| `conversation`   | `list`, `getById`, `create`                                                                                 | Protected |
| `channel`        | `list`, `getById`, `create`, `update`, `delete`                                                             | Protected |
| `apiKey`         | `list`, `getById`, `create`, `update`, `delete`                                                             | Protected |
| `dashboard`      | `stats`, `recentConversations`                                                                              | Protected |
| `document`       | `list`, `getById`, `create`, `delete`                                                                       | Protected |
| `analytics`      | `overview`, `conversationVolume`, `statusDistribution`, `agentRanking`, `channelDistribution`               | Protected |
| `securityCodes`  | `generate`, `getUnused`, `markUsed`                                                                         | Protected |

### Public REST routes

| Route                                                         | Purpose                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| `POST /api/chat/{conversationId}`                             | Send a chat message (via agent)                                |
| `POST /api/documents/ingest`                                  | Upload and ingest a document (optional `agentId` to assign)    |
| `GET /api/public/channels/{channelId}/conversations`          | List widget conversations                                      |
| `POST /api/public/channels/{channelId}/conversations`         | Create a conversation (accepts `{ test: true }` for test mode) |
| `POST /api/public/channels/{channelId}/chat/{conversationId}` | Widget chat                                                    |

---

## Troubleshooting

**Port 3000 is in use**

```sh
kill $(lsof -ti:3000)
```

**Database connection refused**

- Check `pg_isready`, verify `DATABASE_URL` in `.env`
- `docker compose up -d postgres` if you don't have PostgreSQL natively

**AI provider not responding**

- Verify the API key in `apps/web/.env`
- For custom providers, check the baseUrl is correct
- Test with curl: `curl http://localhost:3000/api/trpc/health.ping`
- Test the provider directly: `curl <baseUrl>/models -H "Authorization: Bearer <key>"`

**"Unknown provider type" error**

- Make sure `provider` field in agent config is one of: `openai`, `openai-compatible`

---

## License

MIT
