# WolfConnect Constitution

## Core Principles

### I. Layered Architecture

The backend is organized in four layers — Presentation → Application → Domain → Infrastructure — and responsibilities must never be mixed between them. Controllers only orchestrate (parse the request, call a use case, shape the response, emit socket events); business rules live in Application use cases; contracts (entities, DTOs, repository interfaces) live in Domain with zero framework dependencies; Prisma/Socket.IO/HTTP-client specifics live in Infrastructure behind those interfaces.

### II. Specification-Driven Development

Every feature starts with a specification before implementation: `spec.md` (user stories, functional requirements, success criteria), `plan.md` (technical approach, Constitution Check, project structure), and `tasks.md` (task breakdown by user story), stored under `specs/NNN-feature-name/`. Deviating from this order (building first, documenting after) is a Constitution violation that must be recorded, not silently skipped — see `specs/001-group-chat/plan.md` for the precedent of documenting such a gap honestly instead of hiding it.

### III. History Integrity (NON-NEGOTIABLE)

Business rules that would otherwise destroy history — deleting a user, a message, or a group membership — MUST use soft deletes (`deletedAt`, `leftAt`, nullable `senderId` with `onDelete: SetNull`) instead of hard deletes. A user leaving or being removed from a group must never hide their historical messages or replace their name with a placeholder. Membership-changing events (join, leave, remove, and future events of the same kind) MUST be recorded as visible, traceable system messages, created atomically with the underlying change.

### IV. Security by Default

Passwords are hashed, never stored or logged in plain text. Authentication uses JWT. Secrets live in environment variables, never committed. Every protected action verifies authorization server-side (ownership/role checks happen in the use case or a shared guard, never only in the UI). Input validation is mandatory on every endpoint that accepts user input.

### V. Simplicity and Readability

Prefer readability over clever solutions; keep business logic independent from frameworks; apply KISS and YAGNI. Complexity (e.g., an architectural shortcut, a cross-cutting write inside a repository that "belongs" to a different concern) is allowed only when justified in writing in the relevant `plan.md`'s Complexity Tracking table, explaining why the simpler alternative was rejected.

## Technology & Architecture Constraints

- Backend: Node.js, Express, TypeScript.
- Database: PostgreSQL, Prisma ORM — Prisma is the only ORM; every schema change requires a versioned migration; migrations are never edited after being applied.
- Frontend: Vue 3, Quasar Framework, Tailwind CSS, Pinia, vue-i18n.
- Real-time: Socket.IO, using per-chat rooms (`chat:<id>`) and per-user rooms (`user:<id>`) for targeted broadcasts.
- Infrastructure: Docker, Docker Compose.
- Full narrative context (vision, product scope, definition of done) lives in `docs/CONSTITUTION.md`; this file is the machine-consumable summary the Spec Kit workflow (`/speckit.*`) checks against — the two must stay consistent, and `docs/CONSTITUTION.md` is the tie-breaker when they diverge.

## Development Workflow & Quality Gates

- Git: protected branches `main` and `develop`; work happens on `feature/*`, `fix/*`, `hotfix/*`; direct commits to `main` are forbidden; features merge into `develop` via reviewed pull requests.
- Commits follow Conventional Commits (`feat`, `fix`, `refactor`, `docs`, `chore`, scoped by module, e.g. `feat(chat): ...`).
- Every Pull Request must: compile successfully, pass linting, pass tests (where tests exist), be reviewed before merge, and keep documentation synchronized with the change.
- Critical business rules must have automated tests; where that is not yet true (a known, tracked gap), it must be stated explicitly in the feature's `plan.md` rather than left unmentioned.
- A feature is done when: its specification is approved, code is implemented, code is reviewed, tests are executed, documentation is updated, and it is merged into `develop`.

## Governance

`docs/CONSTITUTION.md` is the authoritative, human-readable constitution for WolfConnect; this file is its Spec-Kit-formatted counterpart used by the `/speckit.*` workflow's Constitution Check gate. Amendments to either must update both in the same change, bump the version below, and update "Last Amended". Any deviation from a principle above must be justified in the relevant feature's `plan.md` (Complexity Tracking) rather than merged silently.

**Version**: 1.0.0 | **Ratified**: 2026-08-10 | **Last Amended**: 2026-08-10
