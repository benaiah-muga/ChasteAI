#!/bin/bash
# ADR Creator — interactive CLI for creating Architecture Decision Records
# Usage: pnpm adr:create

set -e

ADR_DIR="docs/adr"

echo ""
echo "  ┌─────────────────────────────────────┐"
echo "  │  📋 New Architecture Decision Record │"
echo "  └─────────────────────────────────────┘"
echo ""

# Get next ADR number
NEXT_NUM=$(ls -1 "$ADR_DIR"/*.md 2>/dev/null | grep -oP '\d{3}' | sort -rn | head -1)
NEXT_NUM=$((10#${NEXT_NUM:-0} + 1))
NEXT_NUM=$(printf "%03d" "$NEXT_NUM")

read -r -p "  Title: " TITLE
echo ""

SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
FILENAME="${ADR_DIR}/${NEXT_NUM}-${SLUG}.md"

read -r -p "  Status (Proposed/Accepted/Deprecated): " STATUS
STATUS="${STATUS:-Proposed}"

read -r -p  "  Context (what's driving this decision): " CONTEXT
echo ""

read -r -p "  Decision (what was chosen): " DECISION
echo ""

echo "  Alternatives considered (comma-separated, leave blank if none): "
read -r -p "  > " ALTS
echo ""

cat > "$FILENAME" << EOF
# ADR-${NEXT_NUM}: ${TITLE}

**Status:** ${STATUS}

**Date:** $(date +%Y-%m-%d)

## Context

${CONTEXT}

## Decision

${DECISION}

## Consequences

### Positive

- 

### Negative

- 

### Neutral

- 

## Alternatives Considered

EOF

if [ -n "$ALTS" ]; then
  IFS=',' read -ra ALT_ARRAY <<< "$ALTS"
  for alt in "${ALT_ARRAY[@]}"; do
    alt=$(echo "$alt" | xargs)
    echo "- **${alt}**: " >> "$FILENAME"
  done
  echo "" >> "$FILENAME"
fi

echo "  ✅ Created: $FILENAME"
echo ""

# Update ADR index
README="$ADR_DIR/README.md"
if [ -f "$README" ]; then
  # Insert new entry after the header
  sed -i "/^|.*|---|\$/a| ${NEXT_NUM} | ${TITLE} | ${STATUS} |" "$README"
  echo "  📝 Updated ADR index"
fi

echo ""
