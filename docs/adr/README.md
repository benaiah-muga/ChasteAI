# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records for the ChasteAI project.

Each ADR documents a significant architectural decision, including the context, alternatives considered, the chosen approach, and its consequences.

## Active ADRs

| ID  | Title                                               | Status   |
| --- | --------------------------------------------------- | -------- |
| 001 | Monorepo with Turborepo + pnpm                      | Proposed |
| 002 | Drizzle ORM for Database Access                     | Proposed |
| 003 | tRPC for API Layer                                  | Proposed |
| 004 | AI Provider Abstraction Pattern                     | Proposed |
| 005 | Multi-Database Strategy (PostgreSQL + Turso/SQLite) | Proposed |
| 006 | Credentials + OAuth Authentication Strategy         | Accepted |
| 007 | Theme Switching (Light / Dark Mode)                 | Proposed |
| 008 | User Approval Flow                                  | Accepted |
| 009 | Smart Navigation, UX Enhancements, and Web Crawler  | Proposed |
| 010 | Single-Workspace Simplification                     | Accepted |

## Process

1. Create a new ADR file when a significant architectural decision is made
2. Statuses: Proposed → Accepted → Deprecated/Superseded
3. Large architectural changes require an RFC before ADR acceptance
