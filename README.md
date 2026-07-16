# ChasteAI

<p align="center">
  <img src="apps/web/public/logo.png" alt="ChasteAI" width="120" />
</p>

**Open-source AI customer support infrastructure.** Self-host everything locally with zero external dependencies.

- **AI agents** that answer customer questions via chat
- **Multi-channel** (web widget, API, etc.)
- **Document ingestion** with RAG (retrieval-augmented generation)
- **Agent knowledge management** — assign documents to specific agents, custom knowledge instructions
- **Content safety** — configurable moderation of inputs and responses via NVIDIA Nemotron
- **Model configuration** — temperature, max tokens, top-p, and live model list fetching
- **Analytics** across conversations, agents, and channels
- **Security codes** — recovery codes for password reset without email
- **Test conversations** — preview mode for testing agents without polluting analytics
- **API keys** for external integrations
- **Bring your own LLM** — any OpenAI-compatible API works (OpenAI, Groq, NVIDIA NIM, Together, LiteLLM, etc.)

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

### NVIDIA NIM (recommended)

ChasteAI works great with NVIDIA NIM — managed AI inference with content safety built-in.

**Get your API key:** https://build.nvidia.com (free tier available)

**Models:**
| Model | Use Case | Dimensions |
|-------|----------|------------|
| `poolside/laguna-xs-2.1` | Chat & streaming | — |
| `baai/bge-m3` | Embeddings (RAG) | 1024 |
| `nvidia/nemotron-3.5-content-safety` | Content moderation | — |

**Configure in .env:**

```env
NVIDIA_API_KEY="nvapi-..."
```

**Agent config:**

```
Provider: NVIDIA NIM
Model: poolside/laguna-xs-2.1
Base URL: https://integrate.api.nvidia.com/v1
Temperature: 0.7 (adjustable)
Content Safety: Enabled
```

### Content Safety

ChasteAI includes built-in content safety via NVIDIA Nemotron. Configure per-agent:

- **Enable/disable** — toggle safety checks on or off
- **Check responses** — moderate AI responses before sending (default: enabled)
- **Check inputs** — moderate user messages before processing (default: disabled)

When unsafe content is detected, users receive a friendly error message instead of the response.

### Model Configuration

Fine-tune AI behavior per agent:

- **Temperature** (0-1) — lower = more focused, higher = more creative
- **Max tokens** — maximum response length
- **Top-p** — nucleus sampling for response diversity
- **Fetch models** — pull available models from your provider's API

### Providers config file

For teams that want to pre-define providers, create `providers.json` in the project root:

```json
[
  {
    "name": "NVIDIA NIM",
    "type": "openai-compatible",
    "apiKey": "nvapi-...",
    "baseUrl": "https://integrate.api.nvidia.com/v1",
    "defaultModel": "poolside/laguna-xs-2.1"
  },
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
- **PostgreSQL** >= 14 (or use Docker/SQlite)
- **AI provider** — NVIDIA NIM (recommended), OpenAI, Groq, or Ollama

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

# NVIDIA NIM (recommended — free tier available)
NVIDIA_API_KEY="nvapi-..."

# Or use OpenAI/Groq/Ollama (see AI providers section)
```

> Get a free NVIDIA API key at https://build.nvidia.com — no credit card required.

### 3. Set up the database

```sh
createdb chasteai           # Create the database
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed with dev data
```

**Optional: Seed test conversations:**

```sh
pnpm db:seed:conversations  # Create sample conversations for Sudo Inc
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

## Local development alternatives

### Option 1: Ollama (100% local, no API keys)

Run everything locally with Ollama — no external API keys needed.

**1. Install Ollama:** https://ollama.com

**2. Pull models:**

```sh
ollama pull llama3.2          # Chat model
ollama pull nomic-embed-text  # Embeddings (1024 dimensions)
```

**3. Configure .env:**

```env
DATABASE_URL="postgres://postgres:password@localhost:5432/chasteai"
AUTH_SECRET="generate-a-random-secret-here"
# No API keys needed for Ollama
```

**4. Configure agent in dashboard:**

```
Provider: OpenAI Compatible
Base URL: http://localhost:11434/v1
Model: llama3.2
API Key: ollama (or any string)
```

**Pros:** Free, private, runs offline
**Cons:** Requires decent hardware (8GB+ RAM), slower than cloud

### Option 2: NVIDIA NIM (cloud, free tier)

**Pros:** Fast, free tier, content safety included
**Cons:** Requires internet, API key needed

### Option 3: Groq (cloud, free tier)

**Pros:** Very fast inference, free tier
**Cons:** Rate limits, no content safety

### Option 4: OpenAI (cloud, paid)

**Pros:** Best quality, reliable
**Cons:** Requires credit card, costs money

### Recommended setup for development

For local development, we recommend:

1. **PostgreSQL** via Docker: `docker compose up -d postgres`
2. **Ollama** for chat: `ollama pull llama3.2`
3. **Ollama** for embeddings: `ollama pull nomic-embed-text`

This gives you a fully local stack with no external dependencies.

### Recommended setup for production

For production, we recommend:

1. **PostgreSQL** (managed or self-hosted)
2. **NVIDIA NIM** or **OpenAI** for chat
3. **NVIDIA NIM** `baai/bge-m3` for embeddings (or Ollama for cost savings)
4. **Content safety** enabled for response moderation

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
pnpm db:seed          # Seed dev data (user, workspace, agents)
pnpm db:seed:conversations  # Seed test conversations (Sudo Inc)
pnpm db:studio        # Drizzle Studio (db browser at :4983)

# Testing
pnpm test             # Run AI package tests (NVIDIA NIM integration)
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

# AI Providers (at least one required)
NVIDIA_API_KEY      NVIDIA NIM API key (recommended, free tier)
OPENAI_API_KEY      OpenAI API key
GROQ_API_KEY        Groq API key (free, OpenAI-compatible)

# Optional
AUTH_GITHUB_*       GitHub OAuth credentials
AUTH_GOOGLE_*       Google OAuth credentials
```

### AI providers

The provider system is entirely config-driven. There's one provider type — `openai-compatible` — that works with any API that speaks the OpenAI chat completions format.

| API                   | baseUrl                               | How to configure                                                           |
| --------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| **NVIDIA NIM**        | `https://integrate.api.nvidia.com/v1` | Set `NVIDIA_API_KEY` env var, select "NVIDIA NIM" in form (recommended)    |
| OpenAI                | `https://api.openai.com/v1`           | Set `OPENAI_API_KEY` env var, select "OpenAI" in form                      |
| Groq                  | `https://api.groq.com/openai/v1`      | Set `GROQ_API_KEY` env var, or use "OpenAI Compatible" with custom baseUrl |
| Together AI           | `https://api.together.xyz/v1`         | "OpenAI Compatible" with your key                                          |
| LiteLLM               | `http://localhost:4000/v1`            | "OpenAI Compatible" with your key                                          |
| Ollama (via proxy)    | `http://localhost:11434/v1`           | "OpenAI Compatible" (no key needed for local)                              |
| vLLM                  | `http://localhost:8000/v1`            | "OpenAI Compatible" with your key                                          |
| Any OpenAI-compatible | your URL                              | "OpenAI Compatible" in the agent form                                      |

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

---

## Acknowledgements

Built with these amazing open-source projects:

| Project                                          | Description                                           |
| ------------------------------------------------ | ----------------------------------------------------- |
| [NVIDIA NIM](https://build.nvidia.com/)          | Free-tier AI inference API with content safety models |
| [Next.js](https://nextjs.org/)                   | React framework for server-rendered applications      |
| [Drizzle ORM](https://orm.drizzle.team/)         | TypeScript ORM for PostgreSQL and SQLite              |
| [Vitest](https://vitest.dev/)                    | Blazing-fast unit testing framework                   |
| [Tailwind CSS](https://tailwindcss.com/)         | Utility-first CSS framework                           |
| [tRPC](https://trpc.io/)                         | End-to-end typesafe APIs                              |
| [Auth.js](https://authjs.dev/)                   | Authentication for web applications                   |
| [Lucide Icons](https://lucide.dev/)              | Beautiful open-source icons                           |
| [Ollama](https://ollama.com/)                    | Local LLM inference (embeddings)                      |
| [pgvector](https://github.com/pgvector/pgvector) | Vector similarity search for PostgreSQL               |
