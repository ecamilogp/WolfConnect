# Feature Specification: Group Chat Module

**Feature Branch**: `001-group-chat` (documented retroactively; implemented on `feature/frontend-groups`, merged to `develop` via PR #25)

**Created**: 2026-08-10

**Status**: Implemented — this spec was written after the fact to close the gap between the Constitution's Documentation Rules (every feature must contain spec.md/plan.md/tasks.md) and the actual code, which was built module-by-module with the user's direct sign-off at each step instead of going through `/speckit.specify` first.

**Input**: Reconstructed from the implementation history of the Group Chat module (group creation, invitations, roles, message history preservation, and system messages).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a group and choose how people join (Priority: P1)

A user creates a group chat and decides whether new members are added automatically or must accept an invitation first.

**Why this priority**: Without this, there is no group chat at all — it is the entry point to every other capability below.

**Independent Test**: Create a group with each join policy (`AUTO_ADD`, `INVITATION_REQUIRED`) and confirm the creator becomes `OWNER` and the group appears in their chat list.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they create a group with a name and `AUTO_ADD` policy, **Then** the group is created, the user is set as `OWNER`, and the group appears in their chat list.
2. **Given** an authenticated user, **When** they create a group with `INVITATION_REQUIRED` policy, **Then** members added later must accept an invitation instead of being added directly.

---

### User Story 2 - Add or invite members to a group (Priority: P1)

A group owner/admin searches for a user and adds or invites them, immediately after creating the group or at any later point.

**Why this priority**: A group with only its creator has no value; this is the core growth loop of the feature.

**Independent Test**: From an existing group, search for a user and add them; confirm they appear in the member list (or receive a pending invitation, depending on join policy).

**Acceptance Scenarios**:

1. **Given** a group with `AUTO_ADD` policy, **When** an owner/admin selects a user to add, **Then** the user becomes a `MEMBER` immediately and a system message "`{name}` joined the group." appears in the chat.
2. **Given** a group with `INVITATION_REQUIRED` policy, **When** an owner/admin invites a user, **Then** the invited user receives a pending invitation and becomes a `MEMBER` only after accepting it, at which point the same system message appears.
3. **Given** a user who previously left or was removed from the group, **When** an owner/admin adds or re-invites them, **Then** the operation succeeds (their old participant/invitation record is reactivated instead of being rejected as "already a participant").
4. **Given** the post-create flow, **When** a group is created, **Then** a second modal opens immediately offering to add/invite members, without navigating away from the creation flow until that modal is closed.

---

### User Story 3 - Manage member roles and group ownership (Priority: P2)

An owner promotes members to admin, demotes admins, transfers ownership, or removes a participant; admins can remove regular members.

**Why this priority**: Required for groups to be self-governing once they grow beyond a single admin, but the group is usable without it (P1 stories cover the MVP).

**Independent Test**: As an owner, promote a member to admin, then transfer ownership to them, and confirm role labels and permissions update for all participants.

**Acceptance Scenarios**:

1. **Given** an owner, **When** they promote a `MEMBER` to `ADMIN`, **Then** the participant's role updates for everyone in real time and their badge changes accordingly.
2. **Given** an owner, **When** they transfer ownership to an admin, **Then** the previous owner becomes `ADMIN` and the target becomes `OWNER`.
3. **Given** an admin, **When** they attempt to remove another admin, **Then** the action is rejected (only the owner can remove an admin).
4. **Given** any participant, **When** they view the member list, **Then** every participant shows a role badge (Owner, Admin, or Member) — not only owners/admins.

---

### User Story 4 - Leave or remove a participant (Priority: P1)

A member leaves a group voluntarily, or an owner/admin removes a participant.

**Why this priority**: Without a way to leave/remove, group membership is permanent, which is not acceptable for a real chat product.

**Independent Test**: Leave a group as a member and confirm the group disappears from that user's chat list while remaining for everyone else.

**Acceptance Scenarios**:

1. **Given** a `MEMBER` or `ADMIN`, **When** they leave the group, **Then** their participation is soft-deleted (`leftAt` set, never hard-deleted) and a system message "`{name}` left the group." appears for the remaining members.
2. **Given** an owner/admin, **When** they remove a participant, **Then** the same soft-delete happens and a system message "`{name}` was removed from the group." appears.
3. **Given** the `OWNER`, **When** they attempt to leave, **Then** the action is rejected — ownership must be transferred or the group deleted first.

---

### User Story 5 - Preserve message history and traceability (Priority: P1)

Messages sent by a participant who later leaves or is removed must remain visible with the sender's real name, and the group's history must record membership changes as system messages.

**Why this priority**: This was an explicit, non-negotiable requirement — history integrity and traceability are treated as core product guarantees, not a nice-to-have.

**Independent Test**: Have a member send messages, leave the group, and confirm their messages still display their real name (not "deleted user" or similar) and that a system message marks their departure.

**Acceptance Scenarios**:

1. **Given** a participant who sent messages and later left/was removed, **When** any remaining member views the chat history, **Then** those messages still show the sender's real first and last name.
2. **Given** a group membership event (joined, left, removed), **When** it occurs, **Then** a `SYSTEM`-type message is created in the same transaction as the membership change, rendered centered and visually distinct from regular messages, and broadcast in real time (`message:new`) to everyone viewing the chat.
3. **Given** the design must scale to future events, **When** a new membership event type is needed (e.g., name change, ownership transfer), **Then** it can be added as a new `SystemEventType` enum value without changing the message model shape.

### Edge Cases

- Re-adding/re-inviting a user who left: must reactivate their existing `ChatParticipant`/`GroupInvitation` row instead of failing on a uniqueness constraint or a stale "already a participant" check.
- A user is invited while already having an unrelated, previously resolved invitation (accepted/rejected/cancelled) to the same group: the new invitation must be created/reused without violating the one-invitation-per-user-per-group constraint.
- The group owner cannot leave and cannot be removed; must transfer ownership or delete the group.
- Only the owner can remove or demote an admin; an admin cannot act on another admin.
- A deleted user (hard delete, if it ever happens) must not cascade-delete their historical messages — `Message.senderId` is nullable with `onDelete: SetNull`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an authenticated user to create a group chat with a name, optional description/image, and a join policy (`AUTO_ADD` or `INVITATION_REQUIRED`).
- **FR-002**: System MUST let owners/admins add members directly when the join policy is `AUTO_ADD`, or send an invitation that the target user must accept when it is `INVITATION_REQUIRED`.
- **FR-003**: System MUST allow re-adding or re-inviting a user who previously left or was removed, without treating their historical participation as a blocker.
- **FR-004**: System MUST support role management: promote member → admin, demote admin → member, transfer ownership, remove a participant, with permission checks enforced server-side (owner/admin only, admin cannot act on admin, owner is protected).
- **FR-005**: System MUST allow a member/admin to leave a group voluntarily; the owner MUST be blocked from leaving without transferring ownership first.
- **FR-006**: System MUST never hard-delete a `ChatParticipant` or a `Message` as a result of a membership change; departures are recorded via `leftAt`.
- **FR-007**: System MUST preserve the original sender's identity (first name, last name) on every historical message regardless of the sender's current membership status.
- **FR-008**: System MUST create a `SYSTEM` message recording every membership event (`PARTICIPANT_JOINED`, `PARTICIPANT_LEFT`, `PARTICIPANT_REMOVED`) atomically with the underlying membership change.
- **FR-009**: System MUST broadcast membership changes and their system messages in real time to every client viewing the group (`group:participant:removed`, `message:new`).
- **FR-010**: Frontend MUST render system messages visually distinct from regular text messages (centered, neutral style) and MUST render every participant's role as a visible badge.
- **FR-011**: Frontend MUST present a two-step group creation flow: create the group, then immediately offer to add/invite members, deferring navigation to the new chat until that second step is dismissed.

### Key Entities

- **Chat** (`type = GROUP`): name, description, image, `joinPolicy`, soft-deletable (`deletedAt`).
- **ChatParticipant**: links a `User` to a `Chat` with a `role` (`OWNER`/`ADMIN`/`MEMBER`), `joinedAt`, and nullable `leftAt` (soft delete — never removed from the table).
- **GroupInvitation**: one row per `(chatId, invitedUserId)` pair, reused/reset on re-invitation rather than duplicated; `status` (`PENDING`/`ACCEPTED`/`REJECTED`/`CANCELLED`).
- **Message**: `type` (`TEXT`/`SYSTEM`); for `SYSTEM` messages, `senderId` is `null`, and `systemEventType` + `systemEventPayload` (`{ targetUserId, targetName }`) describe the event.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from "create group" to "first member added" in two steps, with zero required page reloads.
- **SC-002**: 100% of historical messages remain visible with the correct sender name after that sender leaves or is removed — zero messages are hidden or reattributed to a placeholder.
- **SC-003**: Every membership event (join, leave, remove) produces exactly one system message, visible to all active participants within the same real-time update that changes the member list.
- **SC-004**: Re-adding a previously departed member succeeds on the first attempt, with no manual database intervention.

## Assumptions

- This is a proof-of-concept product; automated test coverage for these business rules does not exist yet (see `plan.md` → Constitution Check for this gap and the follow-up needed to satisfy the Constitution's Testing Principles).
- Group membership history is retained indefinitely; there is no data-retention/expiry policy for departed members' messages.
- Only two membership-related system event types exist today (join/leave/removed); the schema is intentionally designed to add more (`SystemEventType` enum) without further model changes.
- Notifications and loading UI already existed in the app (`useAppNotify`, `useAppLoading`) and were extended to cover group actions rather than rebuilt.
