# WolfConnect Constitution

Last Updated: 2026-08-10

## Vision

WolfConnect is a proof-of-concept real-time messaging platform designed to demonstrate software engineering best practices through a scalable, secure and maintainable architecture.

The platform allows authenticated users to communicate through private and group conversations in real time while providing a clean development workflow driven by specifications.

---

# Product Scope

The first version of WolfConnect must support:

- User registration
- User authentication
- Private conversations
- Group conversations
- Group invitations with acceptance flow
- Sending text messages
- Emoji support
- File attachments
- Leaving groups
- Preserving full group message history and sender identity even after a member leaves or is removed
- Group role management (owner, admin, member) with permission-based actions
- System messages recording group membership events (joined, left, removed)

Any architectural decision must support these capabilities.

---

# Official Technology Stack

## Backend

- Node.js
- Express
- TypeScript

## Database

- PostgreSQL
- Prisma ORM

## Frontend

- Vue 3
- Quasar Framework
- Tailwind CSS
- Pinia

## Real-Time Communication

- Socket.IO

## Infrastructure

- Docker
- Docker Compose

---

# Engineering Principles

- Build small, testable and maintainable components.
- Prefer readability over clever solutions.
- Keep business logic independent from frameworks.
- Follow SOLID principles whenever applicable.
- Apply KISS and YAGNI.
- Every feature starts with a specification before implementation.

---

# Architecture Principles

Backend follows Layered Architecture.

Presentation Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer

Responsibilities must never be mixed between layers.

---

# Git Strategy

Protected branches

- main
- develop

Feature development

- feature/\*

Bug fixes

- fix/\*

Hotfixes

- hotfix/\*

Direct commits to main are forbidden.

---

# Commit Convention

Conventional Commits are mandatory.

Examples:

- feat(auth): implement user registration
- feat(chat): create private conversations
- fix(groups): resolve invitation validation
- refactor(messages): simplify message service
- docs(spec): update messaging specification
- chore(project): configure Docker

---

# Definition of Done

A feature is considered complete when:

- Specification approved
- Code implemented
- Code reviewed
- Tests executed
- Documentation updated
- Merged into develop

---

# Security Principles

- Passwords must be hashed.
- Authentication uses JWT.
- Secrets are stored in environment variables.
- Input validation is mandatory.
- Authorization must be verified before every protected action.

---

# Database Principles

- Prisma is the only ORM.
- Every schema change requires a migration.
- Database changes must be versioned.
- Soft delete should be preferred when business rules require preserving history.

---

# Documentation Rules

Every feature must contain:

- spec.md
- plan.md
- tasks.md

Architecture decisions should be documented using ADRs whenever a significant technical decision is made.

---

# Testing Principles

Critical business rules must have automated tests.

The proof of concept must include manual validation for all primary user flows.

---

# Quality Standards

Every Pull Request must:

- Compile successfully
- Pass linting
- Pass tests
- Be reviewed before merge
- Keep documentation synchronized
