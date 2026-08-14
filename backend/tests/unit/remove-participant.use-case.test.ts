import { describe, expect, it } from 'vitest';

import { RemoveParticipantUseCase } from '../../src/application/use-cases/chat/remove-participant.use-case.js';
import { BadRequestError } from '../../src/shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../src/shared/errors/forbidden-error.js';
import { NotFoundError } from '../../src/shared/errors/not-found-error.js';
import { buildParticipant, FakeChatRepository } from '../fakes/chat-repository.fake.js';

describe('RemoveParticipantUseCase', () => {
  it('lets an owner remove a member', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const member = buildParticipant({ userId: 'user-member', role: 'MEMBER' });
    const repository = new FakeChatRepository({ participants: [owner, member] });
    const useCase = new RemoveParticipantUseCase(repository);

    const result = await useCase.execute({
      chatId: 'chat-1',
      requesterUserId: 'user-owner',
      targetUserId: 'user-member',
    });

    expect(result.systemMessage).toBe(repository.systemMessage);
    expect(repository.removeParticipantCalls).toEqual([{ chatId: 'chat-1', userId: 'user-member' }]);
    expect(member.leftAt).not.toBeNull();
  });

  it('lets an admin remove a member', async () => {
    const admin = buildParticipant({ userId: 'user-admin', role: 'ADMIN' });
    const member = buildParticipant({ userId: 'user-member', role: 'MEMBER' });
    const repository = new FakeChatRepository({ participants: [admin, member] });
    const useCase = new RemoveParticipantUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-admin', targetUserId: 'user-member' }),
    ).resolves.toBeDefined();
  });

  it('rejects self-removal, pointing at leave-group instead', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const repository = new FakeChatRepository({ participants: [owner] });
    const useCase = new RemoveParticipantUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-owner', targetUserId: 'user-owner' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects a plain member trying to remove someone', async () => {
    const member = buildParticipant({ userId: 'user-member', role: 'MEMBER' });
    const other = buildParticipant({ userId: 'user-other', role: 'MEMBER' });
    const repository = new FakeChatRepository({ participants: [member, other] });
    const useCase = new RemoveParticipantUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-member', targetUserId: 'user-other' }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('protects the owner: the group owner cannot be removed', async () => {
    const admin = buildParticipant({ userId: 'user-admin', role: 'ADMIN' });
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const repository = new FakeChatRepository({ participants: [admin, owner] });
    const useCase = new RemoveParticipantUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-admin', targetUserId: 'user-owner' }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('only the owner can remove an admin', async () => {
    const requestingAdmin = buildParticipant({ userId: 'user-admin-1', role: 'ADMIN' });
    const targetAdmin = buildParticipant({ userId: 'user-admin-2', role: 'ADMIN' });
    const repository = new FakeChatRepository({ participants: [requestingAdmin, targetAdmin] });
    const useCase = new RemoveParticipantUseCase(repository);

    await expect(
      useCase.execute({
        chatId: 'chat-1',
        requesterUserId: 'user-admin-1',
        targetUserId: 'user-admin-2',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('treats a target who already left as not found, not as a valid removal target', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const departedMember = buildParticipant({
      userId: 'user-member',
      role: 'MEMBER',
      leftAt: new Date(),
    });
    const repository = new FakeChatRepository({ participants: [owner, departedMember] });
    const useCase = new RemoveParticipantUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-owner', targetUserId: 'user-member' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
