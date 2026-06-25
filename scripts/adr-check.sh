#!/bin/bash
# ADR Check — pre-commit hook
# Warns when architectural files are changed without a corresponding ADR.
# Bypass with: SKIP_ADR_CHECK=1 git commit

if [ -n "$SKIP_ADR_CHECK" ]; then
  exit 0
fi

# Patterns that indicate an architectural change
ARCH_PATTERNS=(
  "packages/db/src/schemas/"
  "packages/ai/src/providers/"
  "packages/ai/src/types/"
  "packages/ai/src/registry.ts"
  "packages/db/src/client.ts"
  "apps/web/src/server/api/"
  "apps/web/src/auth.ts"
  "apps/web/src/middleware.ts"
  "docker-compose.yml"
  "turbo.json"
  "docs/adr/"
)

STAGED=$(git diff --cached --name-only)

for pattern in "${ARCH_PATTERNS[@]}"; do
  MATCHES=$(echo "$STAGED" | grep "^$pattern" || true)
  if [ -n "$MATCHES" ]; then
    # Check if any ADR was also staged or modified
    ADR_STAGED=$(echo "$STAGED" | grep "^docs/adr/" || true)
    if [ -z "$ADR_STAGED" ]; then
      echo ""
      echo "⚠️  ARCHITECTURAL CHANGE DETECTED"
      echo "   You modified files under: $pattern"
      echo "   Please document this decision in an ADR:"
      echo ""
      echo "   Run:  pnpm adr:create"
      echo ""
      echo "   Or bypass: SKIP_ADR_CHECK=1 git commit"
      echo ""
    fi
  fi
done
