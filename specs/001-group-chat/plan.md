# Implementation Plan: Group Chat Module

**Branch**: `001-group-chat` (retroactive) | **Date**: 2026-08-10 | **Spec**: `./spec.md`

**Input**: Feature specification from `specs/001-group-chat/spec.md`

**Note**: Written retroactively. The actual implementation happened incrementally across `feature/frontend-groups`, module by module, with explicit sign-off from the tech lead before each step — this document reconstructs the plan that flow implied, so future features can be planned upfront instead of after the fact.

## Summary

Add group conversations on top of the existing private-chat/messaging foundation: group creation with a join policy, invite/add flow, role-based administration (owner/admin/member), and a message-history guarantee that survives membership changes (real sender names preserved, membership events recorded as system messages).

## Technical Context

**Language/Version**: TypeScript (Node.js backend, Vue 3 frontend)

**Primary Dependencies**: Express, Prisma ORM, Socket.IO (backend); Vue 3, Quasar Framework, Pinia, vue-i18n, Tailwind CSS (frontend)

**Storage**: PostgreSQL via Prisma; soft deletes on `ChatParticipant.leftAt`, `Message.deletedAt`, `Chat.deletedAt`

**Testing**: None automated for this feature today (see Constitution Check below — flagged as a gap, not resolved by this plan)

**Target Platform**: Web (desktop + mobile-responsive), single Docker Compose deployment

**Project Type**: Web application (`backend/` API + `frontend/` SPA)

**Performance Goals**: N/A — proof-of-concept scale, no formal SLOs defined

**Constraints**: Real-time updates must reach all connected clients viewing a group via Socket.IO rooms (`chat:<id>`); message history must never be mutated or deleted as a side effect of membership changes

**Scale/Scope**: Proof-of-concept scale (not load-tested); one group chat module covering ~10 backend endpoints and ~7 frontend components

## Constitution Check

*GATE: Checked against `docs/CONSTITUTION.md` as it stands after this same change (Product Scope updated to reflect history preservation instead of hiding it).*

- ✅ **Layered Architecture**: Presentation (`chat.controller.ts`) → Application (`*.use-case.ts`) → Domain (`ChatRepository`/`MessageRepository` interfaces, DTOs) → Infrastructure (`Prisma*Repository`). No layer skips another.
- ✅ **Prisma is the only ORM / every schema change has a migration**: two migrations added (`20260810120000_add_group_system_messages`, `20260810130000_add_participant_joined_event`).
- ✅ **Soft delete preferred for history-preserving business rules**: `ChatParticipant.leftAt`, `Message.senderId` nullable with `onDelete: SetNull` instead of `Cascade`.
- ✅ **Conventional Commits**: `feat(chat): preserve message history and add system-message support`, `feat(chat): add group chat module with roles, invitations and admin actions`, `feat(chat): add groups UI, system-message rendering and auth UX polish`.
- ⚠️ **Testing Principles ("critical business rules must have automated tests")**: NOT satisfied. Role permission checks, the leave/remove/rejoin flows, and system-message creation have no automated tests — only manual validation was performed during implementation. This is a known gap; see Complexity Tracking below.
- ⚠️ **Documentation Rules ("every feature must contain spec.md/plan.md/tasks.md")**: NOT satisfied at implementation time — this plan and its sibling docs were written after the fact specifically to close that gap for this feature. Earlier modules (auth, private chat, messages) still have no specs.

## Project Structure

### Documentation (this feature)

```text
specs/001-group-chat/
├── plan.md              # This file
└── tasks.md             # Retroactive task breakdown
```

No `research.md`/`data-model.md`/`contracts/` were produced separately — the data model is documented inline in `spec.md` (Key Entities) since the feature was small enough not to need standalone research artifacts.

### Source Code (repository root)

```text
backend/
├── prisma/
│   ├── schema.prisma                          # Chat, ChatParticipant, GroupInvitation, Message (+SystemEventType)
│   └── migrations/
│       ├── 20260810120000_add_group_system_messages/
│       └── 20260810130000_add_participant_joined_event/
└── src/
    ├── domain/
    │   ├── dto/chat/                           # group-detail, group-participant-summary
    │   ├── dto/chat-group-invitations/         # pending-invitation-summary
    │   ├── dto/message/                        # message-sender-summary, +systemEventType/Payload fields
    │   └── repositories/                       # ChatRepository, GroupInvitationRepository (interfaces)
    ├── application/use-cases/chat/             # create/invite/accept/leave/remove/promote/demote/transfer/get-*
    ├── infrastructure/
    │   ├── repositories/prisma-chat.repository.ts        # upsert-based add/re-invite, system-message creation
    │   ├── repositories/prisma-group-invitation.repository.ts
    │   ├── mappers/message.mapper.ts           # shared Message → DTO mapping (sender, system fields)
    │   └── websocket/                          # socket-events.enum.ts, socket-payloads.type.ts
    └── presentation/
        ├── controllers/chat.controller.ts      # group endpoints + socket emits
        └── routes/chat.routes.ts

frontend/
└── src/
    ├── components/chat/
    │   ├── CreateGroupModal.vue
    │   ├── GroupPostCreateInviteModal.vue
    │   ├── GroupInfoPanel.vue
    │   ├── GroupMemberListItem.vue
    │   ├── GroupInviteSearchPanel.vue
    │   ├── PendingInvitationsModal.vue
    │   ├── SystemMessageItem.vue
    │   ├── MessageBubble.vue / MessageList.vue     # branch on message.type, resolve sender from payload
    ├── composables/
    │   ├── useAppNotify.ts / useAppLoading.ts       # shared Notify/Loading wrappers, i18n-aware
    │   └── useUserSearch.ts
    ├── stores/group.store.ts / chat.store.ts / message.store.ts
    ├── services/http/group.service.ts
    ├── types/models/group.model.ts / message.model.ts
    └── utils/api-error-messages.ts                  # backend error literal → i18n key mapping
```

**Structure Decision**: Standard `backend/` + `frontend/` split already established by prior modules; group functionality extends the existing `Chat`/`Message` domain rather than introducing a separate bounded context, since a group is just a `Chat` with `type = GROUP`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| System-message creation lives inside `PrismaChatRepository` (`leaveGroup`, `removeParticipant`, `addParticipant`, `acceptGroupInvitation`) instead of a separate `MessageRepository` call | The membership change (`ChatParticipant.leftAt`/upsert) and the system message must commit atomically — if the process crashes between the two writes, the chat would show a member gone with no explanation, or a "someone joined" message with no matching participant | A two-step call (update participant, then separately create the message) was rejected because there is no shared cross-repository transaction context in this codebase; splitting the writes risks a partially-applied membership change |
| No automated tests for this feature | Delivered under direct, iterative sign-off from the tech lead per module, prioritizing shipping the module-by-module workflow already in place | Full TDD was not applied for this feature; flagged here as a Constitution violation rather than silently ignored — follow-up: add integration tests for role guards and the leave/remove/rejoin/system-message flows before the next feature ships |
