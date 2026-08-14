---

description: "Task list for the Group Chat module (retroactive record)"

---

# Tasks: Group Chat Module

**Input**: Design documents from `specs/001-group-chat/` (`spec.md`, `plan.md`)

**Note**: Written retroactively. All tasks below were already implemented and merged to `develop` via PR #25 (`feature/frontend-groups`), across three commits: `a48c458` (message-system infra), `f7b151c` (groups backend), `36e9d8a` (groups + system-message frontend). This file exists to satisfy the Constitution's Documentation Rules and to give the next feature a template to fill in *before* implementation instead of after.

**Tests**: Not included — no automated tests were written for this feature (tracked as a gap in `plan.md` → Complexity Tracking).

**Organization**: Tasks are grouped by user story, matching `spec.md`.

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Add `GroupJoinPolicy`, `ParticipantRole`, `InvitationStatus` enums and `Chat.joinPolicy` to `backend/prisma/schema.prisma`
- [X] T002 Add `GROUP_*` and `MESSAGE_NEW`/`CHAT_LEFT` events to `backend/src/infrastructure/websocket/events/socket-events.enum.ts`
- [X] T003 [P] Add `Group*Payload` types to `backend/src/infrastructure/websocket/types/socket-payloads.type.ts`

**Checkpoint**: Group-capable schema and socket event contracts exist.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared message-history/system-message plumbing that every membership use case depends on.

- [X] T004 Make `Message.senderId` nullable, add `SystemEventType` enum (`PARTICIPANT_LEFT`, `PARTICIPANT_REMOVED`, `PARTICIPANT_JOINED`) and `systemEventType`/`systemEventPayload` columns in `backend/prisma/schema.prisma`
- [X] T005 Write migrations `backend/prisma/migrations/20260810120000_add_group_system_messages/` and `.../20260810130000_add_participant_joined_event/`
- [X] T006 [P] Add `MessageSenderSummaryDto` in `backend/src/domain/dto/message/message-sender-summary.dto.ts`
- [X] T007 [P] Extend `MessageListItemDto`/`MessageResponseDto`/`ReplyToMessageDto`/`UpdateMessageResponseDto` with nullable `senderId`, `sender`, `systemEventType`, `systemEventPayload`
- [X] T008 Create shared `MessageMapper` in `backend/src/infrastructure/mappers/message.mapper.ts` (used by both `PrismaMessageRepository` and `PrismaChatRepository`)
- [X] T009 Update `PrismaMessageRepository` to include `sender` on every query and map through `MessageMapper`

**Checkpoint**: Any message (including future system messages) can carry a preserved sender snapshot — ready for the group use cases below.

---

## Phase 3: User Story 1 - Create a group and choose how people join (Priority: P1) 🎯 MVP

**Goal**: A user can create a group with a join policy and become its owner.

**Independent Test**: Create a group with each join policy; confirm creator is `OWNER` and the group appears in their chat list.

- [X] T010 [US1] `CreateGroupChatUseCase` + `POST /chats/groups` in `backend/src/presentation/routes/chat.routes.ts` / `chat.controller.ts`
- [X] T011 [US1] `CreateGroupModal.vue` — name, description, join-policy selector (`frontend/src/components/chat/CreateGroupModal.vue`)
- [X] T012 [US1] `group.store.ts` + `group.service.ts` for group CRUD calls from the frontend

**Checkpoint**: Groups can be created end-to-end.

---

## Phase 4: User Story 2 - Add or invite members (Priority: P1)

**Goal**: Owners/admins can add or invite members, immediately after creation or later, including re-adding someone who left.

**Independent Test**: Add a member under `AUTO_ADD`; invite+accept under `INVITATION_REQUIRED`; re-add someone who previously left.

- [X] T013 [US2] `InviteUserToGroupUseCase` (auto-add vs. invitation branching) in `backend/src/application/use-cases/chat/invite-user-to-group.use-case.ts`
- [X] T014 [US2] `AcceptGroupInvitationUseCase` / `GetPendingInvitationsUseCase` in `backend/src/application/use-cases/chat/`
- [X] T015 [US2] `GroupPostCreateInviteModal.vue` — second modal opened immediately after group creation, deferring navigation until it closes (`frontend/src/components/layout/AppSidebar.vue` + modal component)
- [X] T016 [US2] `GroupInviteSearchPanel.vue` + shared `useUserSearch.ts` composable
- [X] T017 [US2] `PendingInvitationsModal.vue` for the invited user's inbox
- [X] T018 [US2] Fix: `invitedParticipant && !invitedParticipant.leftAt` check in `invite-user-to-group.use-case.ts` so a departed member is no longer blocked as "already a participant"
- [X] T019 [US2] Fix: `PrismaChatRepository.addParticipant` / `acceptGroupInvitation` use `upsert` instead of `create` so a returning member reactivates their row instead of hitting a uniqueness violation
- [X] T020 [US2] Fix: `PrismaGroupInvitationRepository.create` upserts on `(chatId, invitedUserId)` so a re-invitation doesn't collide with a resolved historical invitation

**Checkpoint**: Members can be added/invited, including re-adding someone who left, without errors.

---

## Phase 5: User Story 3 - Manage roles and ownership (Priority: P2)

**Goal**: Owner/admin permission-gated actions: promote, demote, transfer ownership, remove.

**Independent Test**: Promote a member, transfer ownership to them, confirm badges and permissions update live.

- [X] T021 [US3] `PromoteToAdminUseCase` / `DemoteAdminUseCase` / `TransferOwnershipUseCase` / `RemoveParticipantUseCase` + shared guards in `backend/src/application/use-cases/chat/group-admin.guards.ts`
- [X] T022 [US3] `GroupInfoPanel.vue` — role-gated action menu per participant (`frontend/src/components/chat/GroupInfoPanel.vue`)
- [X] T023 [US3] `GroupMemberListItem.vue` — visible role badge for every participant, including `MEMBER` (previously hidden)
- [X] T024 [US3] Real-time role/ownership sync via `GROUP_ROLE_CHANGED` / `GROUP_OWNERSHIP_TRANSFERRED` socket events

**Checkpoint**: Roles and ownership are fully manageable and reflected live for all participants.

---

## Phase 6: User Story 4 - Leave or remove a participant (Priority: P1)

**Goal**: Members can leave; owners/admins can remove; the owner is protected.

**Independent Test**: Leave as a member; remove a member as an owner; confirm the owner cannot leave or be removed.

- [X] T025 [US4] `LeaveGroupUseCase` / `RemoveParticipantUseCase` with owner-protection guards
- [X] T026 [US4] `PrismaChatRepository.leaveGroup` / `removeParticipant` soft-delete via `leftAt` (never hard-deleted)
- [X] T027 [US4] Fix: emit `GROUP_PARTICIPANT_REMOVED` from `leaveGroup` too (previously only emitted from `removeParticipant`, leaving other clients' rosters stale when someone left voluntarily)

**Checkpoint**: Leave/remove works symmetrically and keeps every client's member list in sync.

---

## Phase 7: User Story 5 - Preserve message history and traceability (Priority: P1)

**Goal**: Historical messages keep the real sender name; every membership event produces a system message.

**Independent Test**: Send messages, leave the group, confirm the messages still show the real name and a system message marks the departure.

- [X] T028 [US5] `PrismaChatRepository.createGroupSystemMessage` — creates the `SYSTEM` message in the same `$transaction` as the membership change, for `leaveGroup`, `removeParticipant`, `addParticipant`, `acceptGroupInvitation`
- [X] T029 [US5] Propagate the created system message through `LeaveGroupUseCase` / `RemoveParticipantUseCase` / `InviteUserToGroupUseCase` / `AcceptGroupInvitationUseCase` return values
- [X] T030 [US5] Emit `message:new` with the system message from `chat.controller.ts` for all four flows
- [X] T031 [US5] `SystemMessageItem.vue` — centered, neutral rendering, switches text by `systemEventType`
- [X] T032 [US5] `MessageList.vue` branches `SystemMessageItem` vs. `MessageBubble` by `message.type`; `MessageBubble.vue` resolves the sender name from `message.sender` instead of the caller-supplied participant map
- [X] T033 [US5] Remove the `participantNames` lookup hack from `frontend/src/pages/chat/ChatPage.vue` now that the backend always returns `sender` on every message
- [X] T034 [US5] i18n keys `chat.systemEvents.participantJoined/Left/Removed` in `frontend/src/locales/en.json` and `es.json`

**Checkpoint**: History is fully traceable; all five user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T035 [P] `useAppNotify.ts` / `useAppLoading.ts` composables — i18n-aware Notify/Loading wrappers reused across all group modals and auth pages
- [X] T036 [P] `api-error-messages.ts` — maps backend literal error strings to i18n keys (`groupErrors.*`, `authErrors.*`)
- [X] T037 Remove the duplicate loading overlay on login (the submit button already shows its own spinner); keep it on logout/register
- [X] T038 `docs/CONSTITUTION.md` — Product Scope corrected to state that full history is preserved (previously said the opposite)
- [X] T039 Add automated tests for role guards, leave/remove/rejoin, and system-message creation (`backend/tests/unit/`, Vitest — unit tests against hand-written fakes; see `backend/vitest.config.ts`)

---

## Dependencies & Execution Order

- **Setup (Phase 1)** and **Foundational (Phase 2)** must land before any user story — US2–US5 all create or consume system messages, which depend on Phase 2's shared `MessageMapper`/DTOs.
- **US1 → US2 → US4/US3 → US5**: in practice this feature was NOT built strictly in story-priority order — US5 (history preservation) was requested by the tech lead mid-implementation, after US1–US4 already existed, and the fixes in T018–T020, T027 were bugs found during manual validation after US2/US4 first shipped. This file records the dependency graph the work *should* follow next time, not the exact chronological order it happened in.
- **Polish (Phase 8)** depends on all user stories being complete.

## Notes

- Commit correspondence: T001–T009 ≈ `a48c458` (message-system infra), T010, T013–T014, T018–T021, T025–T030 ≈ `f7b151c` (groups backend), T011–T012, T015–T017, T022–T024, T031–T037 ≈ `36e9d8a` (groups + system-message frontend).
- T039 was the only open item from this feature; it has since been closed (see Phase 8).
