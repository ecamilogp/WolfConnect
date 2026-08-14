import { describe, expect, it } from 'vitest';

import { PromoteToAdminUseCase } from '../../src/application/use-cases/chat/promote-to-admin.use-case.js';
import { DemoteAdminUseCase } from '../../src/application/use-cases/chat/demote-admin.use-case.js';
import { TransferOwnershipUseCase } from '../../src/application/use-cases/chat/transfer-ownership.use-case.js';
import { BadRequestError } from '../../src/shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../src/shared/errors/forbidden-error.js';
import { buildParticipant, FakeChatRepository } from '../fakes/chat-repository.fake.js';

describe('PromoteToAdminUseCase', () => {
  it('lets the owner promote a member to admin', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const member = buildParticipant({ userId: 'user-member', role: 'MEMBER' });
    const repository = new FakeChatRepository({ participants: [owner, member] });
    const useCase = new PromoteToAdminUseCase(repository);

    await useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-owner', targetUserId: 'user-member' });

    expect(member.role).toBe('ADMIN');
  });

  it('rejects a non-owner (including an admin) trying to promote', async () => {
    const admin = buildParticipant({ userId: 'user-admin', role: 'ADMIN' });
    const member = buildParticipant({ userId: 'user-member', role: 'MEMBER' });
    const repository = new FakeChatRepository({ participants: [admin, member] });
    const useCase = new PromoteToAdminUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-admin', targetUserId: 'user-member' }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('rejects promoting someone who is already an admin', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const admin = buildParticipant({ userId: 'user-admin', role: 'ADMIN' });
    const repository = new FakeChatRepository({ participants: [owner, admin] });
    const useCase = new PromoteToAdminUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-owner', targetUserId: 'user-admin' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects changing your own role', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const repository = new FakeChatRepository({ participants: [owner] });
    const useCase = new PromoteToAdminUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-owner', targetUserId: 'user-owner' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe('DemoteAdminUseCase', () => {
  it('lets the owner demote an admin back to member', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const admin = buildParticipant({ userId: 'user-admin', role: 'ADMIN' });
    const repository = new FakeChatRepository({ participants: [owner, admin] });
    const useCase = new DemoteAdminUseCase(repository);

    await useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-owner', targetUserId: 'user-admin' });

    expect(admin.role).toBe('MEMBER');
  });

  it('rejects demoting a plain member (nothing to demote)', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const member = buildParticipant({ userId: 'user-member', role: 'MEMBER' });
    const repository = new FakeChatRepository({ participants: [owner, member] });
    const useCase = new DemoteAdminUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-owner', targetUserId: 'user-member' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe('TransferOwnershipUseCase', () => {
  it('swaps roles: the previous owner becomes admin and the target becomes owner', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const admin = buildParticipant({ userId: 'user-admin', role: 'ADMIN' });
    const repository = new FakeChatRepository({ participants: [owner, admin] });
    const useCase = new TransferOwnershipUseCase(repository);

    await useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-owner', targetUserId: 'user-admin' });

    expect(owner.role).toBe('ADMIN');
    expect(admin.role).toBe('OWNER');
  });

  it('rejects a non-owner trying to transfer ownership', async () => {
    const admin = buildParticipant({ userId: 'user-admin', role: 'ADMIN' });
    const member = buildParticipant({ userId: 'user-member', role: 'MEMBER' });
    const repository = new FakeChatRepository({ participants: [admin, member] });
    const useCase = new TransferOwnershipUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-admin', targetUserId: 'user-member' }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('rejects transferring ownership to yourself', async () => {
    const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
    const repository = new FakeChatRepository({ participants: [owner] });
    const useCase = new TransferOwnershipUseCase(repository);

    await expect(
      useCase.execute({ chatId: 'chat-1', requesterUserId: 'user-owner', targetUserId: 'user-owner' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
