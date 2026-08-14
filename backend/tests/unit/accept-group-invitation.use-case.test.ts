import { describe, expect, it } from 'vitest';

import { AcceptGroupInvitationUseCase } from '../../src/application/use-cases/chat/accept-group-invitation.use-case.js';
import { ConflictError } from '../../src/shared/errors/conflict-error.js';
import { ForbiddenError } from '../../src/shared/errors/forbidden-error.js';
import { NotFoundError } from '../../src/shared/errors/not-found-error.js';
import { buildChat, FakeChatRepository } from '../fakes/chat-repository.fake.js';
import { buildUser, FakeUserRepository } from '../fakes/user-repository.fake.js';
import { buildInvitation, FakeGroupInvitationRepository } from '../fakes/group-invitation-repository.fake.js';
import { createFakeSendNotificationUseCase } from '../fakes/notification.fake.js';

function setup() {
  const chat = buildChat();
  const chatRepository = new FakeChatRepository({ chat, participants: [] });
  const userRepository = new FakeUserRepository([
    buildUser({ id: 'user-invitee', firstName: 'Invitee', lastName: 'Person' }),
  ]);
  const groupInvitationRepository = new FakeGroupInvitationRepository([
    buildInvitation({
      id: 'invitation-1',
      chatId: 'chat-1',
      invitedByUserId: 'user-owner',
      invitedUserId: 'user-invitee',
      status: 'PENDING',
    }),
  ]);
  const { sendNotificationUseCase, sentNotifications } = createFakeSendNotificationUseCase();

  const useCase = new AcceptGroupInvitationUseCase(
    chatRepository,
    groupInvitationRepository,
    userRepository,
    sendNotificationUseCase,
  );

  return { useCase, chatRepository, groupInvitationRepository, sentNotifications };
}

describe('AcceptGroupInvitationUseCase', () => {
  it('accepts a pending invitation addressed to the current user', async () => {
    const { useCase, chatRepository, sentNotifications } = setup();

    const result = await useCase.execute('invitation-1', 'user-invitee');

    expect(result).toEqual({
      message: 'Invitation accepted successfully.',
      chatId: 'chat-1',
      systemMessage: chatRepository.systemMessage,
    });
    expect(chatRepository.acceptGroupInvitationCalls).toEqual([
      { invitationId: 'invitation-1', chatId: 'chat-1', userId: 'user-invitee' },
    ]);
    expect(
      sentNotifications.some((n) => n.type === 'GROUP_INVITATION_ACCEPTED' && n.userId === 'user-owner'),
    ).toBe(true);
  });

  it('throws NotFoundError for a non-existent invitation', async () => {
    const { useCase } = setup();

    await expect(useCase.execute('missing-invitation', 'user-invitee')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('throws ForbiddenError when accepted by someone other than the invitee', async () => {
    const { useCase } = setup();

    await expect(useCase.execute('invitation-1', 'someone-else')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('throws ConflictError when the invitation was already processed', async () => {
    const { useCase, groupInvitationRepository } = setup();
    groupInvitationRepository.invitations[0].status = 'ACCEPTED';

    await expect(useCase.execute('invitation-1', 'user-invitee')).rejects.toBeInstanceOf(ConflictError);
  });
});
