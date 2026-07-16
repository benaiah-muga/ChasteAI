---
name: Pull Request
about: Submit a change to ChasteAI
title: ""
labels: ""
assignees: ""
---

## Summary

<!-- What does this PR do? One or two sentences. -->

## Motivation

<!-- Why is this change needed? Link to an issue or ADR if applicable. -->

## Changes

<!-- Bullet list of what changed. Group by area (db, api, ui, etc.) -->

-

## Type of Change

<!-- Check one -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactor (no functional change)
- [ ] Documentation update
- [ ] Schema migration (database change)
- [ ] Config / infrastructure change

## Testing

<!-- How was this tested? -->

- [ ] `pnpm turbo typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Tested locally in browser (describe what you tested)
- [ ] SQLite compatibility verified (if DB change)
- [ ] PostgreSQL compatibility verified (if DB change)
- [ ] Mobile responsive (if UI change)

## Screenshots

<!-- If UI changed, include before/after screenshots. Delete this section if not applicable. -->

## ADR

<!-- Is there an ADR for this change? Link it here. If this is a significant architectural change and no ADR exists, create one with `pnpm adr:create`. Delete this section if not applicable. -->

## Checklist

- [ ] Code follows existing conventions (no comments, no emoji, Prettier formatted)
- [ ] No hardcoded secrets, keys, or credentials
- [ ] Both PG and SQLite schemas are in sync (if schema change)
- [ ] `AGENTS.md` updated (if architecture or gotchas changed)
- [ ] `README.md` updated (if user-facing feature changed)
- [ ] Conventional commit message (`feat:`, `fix:`, `chore:`, `docs:`, etc.)
