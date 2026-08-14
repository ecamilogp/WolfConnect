import { describe, expect, it } from 'vitest';

import {
  requireActiveGroup,
  requireActiveParticipant,
  requireActiveTargetParticipant,
  requireGroupOwner,
  requireOwnerOrAdmin,
} from '../../src/application/use-cases/chat/group-admin.guards.js';
import { ForbiddenError } from '../../src/shared/errors/forbidden-error.js';
import { NotFoundError } from '../../src/shared/errors/not-found-error.js';
import { buildChat, buildParticipant, FakeChatRepository } from '../fakes/chat-repository.fake.js';

describe('requireActiveGroup', () => {
  it('returns the chat when it exists and is not deleted', async () => {
    const chat = buildChat({ id: 'chat-1' });
    const repository = new FakeChatRepository({ chat });

    await expect(requireActiveGroup(repository, 'chat-1')).resolves.toBe(chat);
  });

  it('throws NotFoundError when the chat does not exist', async () => {
    const repository = new FakeChatRepository({ chat: null });

    await expect(requireActiveGroup(repository, 'missing-chat')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when the chat has been soft-deleted', async () => {
    const chat = buildChat({ id: 'chat-1', deletedAt: new Date() });
    const repository = new FakeChatRepository({ chat });

    await expect(requireActiveGroup(repository, 'chat-1')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('requireActiveParticipant', () => {
  it('returns the participant when active', async () => {
    const participant = buildParticipant({ userId: 'user-1', leftAt: null });
    const repository = new FakeChatRepository({ participants: [participant] });

    await expect(requireActiveParticipant(repository, 'chat-1', 'user-1')).resolves.toBe(participant);
  });

  it('throws ForbiddenError when the user was never a participant', async () => {
    const repository = new FakeChatRepository({ participants: [] });

    await expect(requireActiveParticipant(repository, 'chat-1', 'user-1')).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it('throws ForbiddenError when the user has already left', async () => {
    const participant = buildParticipant({ userId: 'user-1', leftAt: new Date() });
    const repository = new FakeChatRepository({ participants: [participant] });

    await expect(requireActiveParticipant(repository, 'chat-1', 'user-1')).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});

describe('requireActiveTargetParticipant', () => {
  it('throws NotFoundError (not ForbiddenError) for a departed target', async () => {
    const participant = buildParticipant({ userId: 'user-2', leftAt: new Date() });
    const repository = new FakeChatRepository({ participants: [participant] });

    await expect(
      requireActiveTargetParticipant(repository, 'chat-1', 'user-2'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('requireGroupOwner', () => {
  it('returns the requester when they are the owner', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const repository = new FakeChatRepository({ participants: [owner] });

    await expect(
      requireGroupOwner(repository, 'chat-1', 'user-owner', 'Only the owner can do this.'),
    ).resolves.toBe(owner);
  });

  it('throws ForbiddenError for an admin (not just members)', async () => {
    const admin = buildParticipant({ userId: 'user-admin', role: 'ADMIN' });
    const repository = new FakeChatRepository({ participants: [admin] });

    await expect(
      requireGroupOwner(repository, 'chat-1', 'user-admin', 'Only the owner can do this.'),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe('requireOwnerOrAdmin', () => {
  it.each(['OWNER', 'ADMIN'] as const)('allows role %s', (role) => {
    const participant = buildParticipant({ role });

    expect(() => requireOwnerOrAdmin(participant, 'Not allowed.')).not.toThrow();
  });

  it('throws ForbiddenError for a plain member', () => {
    const participant = buildParticipant({ role: 'MEMBER' });

    expect(() => requireOwnerOrAdmin(participant, 'Not allowed.')).toThrow(ForbiddenError);
  });
});
