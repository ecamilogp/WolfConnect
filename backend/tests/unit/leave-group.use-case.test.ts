import { describe, expect, it } from 'vitest';

import { LeaveGroupUseCase } from '../../src/application/use-cases/chat/leave-group.use-case.js';
import { BadRequestError } from '../../src/shared/errors/bad-request-error.js';
import { ConflictError } from '../../src/shared/errors/conflict-error.js';
import { ForbiddenError } from '../../src/shared/errors/forbidden-error.js';
import { NotFoundError } from '../../src/shared/errors/not-found-error.js';
import { buildChat, buildParticipant, FakeChatRepository } from '../fakes/chat-repository.fake.js';

describe('LeaveGroupUseCase', () => {
  it('lets a member leave and marks them as departed via a system message', async () => {
    const member = buildParticipant({ userId: 'user-member', role: 'MEMBER' });
    const repository = new FakeChatRepository({ participants: [member] });
    const useCase = new LeaveGroupUseCase(repository);

    const result = await useCase.execute('chat-1', 'user-member');

    expect(result.systemMessage).toBe(repository.systemMessage);
    expect(repository.leaveGroupCalls).toEqual([{ chatId: 'chat-1', userId: 'user-member' }]);
    expect(member.leftAt).not.toBeNull();
  });

  it('throws NotFoundError when the chat does not exist', async () => {
    const repository = new FakeChatRepository({ chat: null });
    const useCase = new LeaveGroupUseCase(repository);

    await expect(useCase.execute('missing-chat', 'user-member')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws BadRequestError for a private chat', async () => {
    const chat = buildChat({ type: 'PRIVATE' });
    const repository = new FakeChatRepository({ chat });
    const useCase = new LeaveGroupUseCase(repository);

    await expect(useCase.execute('chat-1', 'user-member')).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws ForbiddenError when the user was never a participant', async () => {
    const repository = new FakeChatRepository({ participants: [] });
    const useCase = new LeaveGroupUseCase(repository);

    await expect(useCase.execute('chat-1', 'user-stranger')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('throws ConflictError when the user already left', async () => {
    const member = buildParticipant({ userId: 'user-member', leftAt: new Date() });
    const repository = new FakeChatRepository({ participants: [member] });
    const useCase = new LeaveGroupUseCase(repository);

    await expect(useCase.execute('chat-1', 'user-member')).rejects.toBeInstanceOf(ConflictError);
  });

  it('protects the owner: the group owner cannot leave', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const repository = new FakeChatRepository({ participants: [owner] });
    const useCase = new LeaveGroupUseCase(repository);

    await expect(useCase.execute('chat-1', 'user-owner')).rejects.toBeInstanceOf(ConflictError);
    expect(repository.leaveGroupCalls).toHaveLength(0);
  });
});
