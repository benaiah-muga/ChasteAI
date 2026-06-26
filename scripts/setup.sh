#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────
# ChasteAI — Setup Script
# ──────────────────────────────────────────────────────
# Run this script to get the project up and running:
#   bash scripts/setup.sh
#
# It will:
#   1. Check prerequisites (node, pnpm)
#   2. Create environment files from examples
#   3. Install dependencies
#   4. Build all packages
#   5. Launch interactive database setup (SQLite / Turso)
#   6. Print success info
# ──────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[info]${NC} $1"; }
ok()    { echo -e "${GREEN}[ ok ]${NC} $1"; }
warn()  { echo -e "${YELLOW}[warn]${NC} $1"; }
err()   { echo -e "${RED}[error]${NC} $1"; }

info "ChasteAI — Setup"
info "────────────────"

# ── 1. Prerequisites ──────────────────────────────────

info "Checking prerequisites..."

# Node.js
if ! command -v node &>/dev/null; then
  err "Node.js is not installed. Install Node.js >= 20: https://nodejs.org"
  exit 1
fi
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  err "Node.js >= 20 required. Found: $(node -v)"
  exit 1
fi
ok "Node.js $(node -v)"

# pnpm
if ! command -v pnpm &>/dev/null; then
  info "pnpm not found. Installing via corepack..."
  corepack enable
  corepack prepare pnpm@latest --activate
fi
ok "pnpm $(pnpm -v)"

# ── 2. Environment files ──────────────────────────────

info "Setting up environment files..."

if [ ! -f apps/web/.env ]; then
  cp .env.example apps/web/.env
  ok "Created apps/web/.env from .env.example"
else
  ok "apps/web/.env already exists"
fi

# Ensure AUTH_SECRET
ENV_FILE="apps/web/.env"
if ! grep -q "AUTH_SECRET" "$ENV_FILE" 2>/dev/null; then
  info "Generating AUTH_SECRET..."
  SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-me-in-production")
  echo "AUTH_SECRET=\"$SECRET\"" >> "$ENV_FILE"
  ok "AUTH_SECRET generated"
fi

# ── 3. Install dependencies ───────────────────────────

info "Installing dependencies..."
pnpm install
ok "Dependencies installed"

# ── 4. Build packages ─────────────────────────────────

info "Building packages..."
pnpm build
ok "Build complete"

# ── 5. Database setup (interactive TUI) ───────────────

echo ""
info "Launching interactive database setup..."
info "  SQLite  — quick start, local file, zero config"
info "  Turso   — edge database with remote sync"
echo ""
pnpm setup:db
ok "Database configured"

# ── 6. Done ────────────────────────────────────────────

echo ""
echo -e "${GREEN}┌──────────────────────────────────────────────────────────┐${NC}"
echo -e "${GREEN}│${NC}  ChasteAI is ready!                                        ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}                                                          ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}  Start the dev server:                                    ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}    ${CYAN}pnpm dev${NC}                                                ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}                                                          ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}  Open the setup wizard in your browser:                    ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}    ${BLUE}http://localhost:3000/setup${NC}                              ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}                                                          ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}  Docs:                                                     ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}    Architecture: ${BLUE}docs/adr/${NC}                                ${GREEN}│${NC}"
echo -e "${GREEN}│${NC}    Setup guide:  ${BLUE}README.md${NC}                                 ${GREEN}│${NC}"
echo -e "${GREEN}└──────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "  ${YELLOW}Tip:${NC} Start the dev server with ${CYAN}pnpm dev${NC}"
echo -e "  Then open ${BLUE}http://localhost:3000/setup${NC} in your browser."
echo ""
