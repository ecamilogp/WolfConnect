import { describe, expect, it } from 'vitest';

import { InviteUserToGroupUseCase } from '../../src/application/use-cases/chat/invite-user-to-group.use-case.js';
import { BadRequestError } from '../../src/shared/errors/bad-request-error.js';
import { NotFoundError } from '../../src/shared/errors/not-found-error.js';
import { buildChat, buildParticipant, FakeChatRepository } from '../fakes/chat-repository.fake.js';
import { buildUser, FakeUserRepository } from '../fakes/user-repository.fake.js';
import { FakeGroupInvitationRepository } from '../fakes/group-invitation-repository.fake.js';
import { createFakeSendNotificationUseCase } from '../fakes/notification.fake.js';

function setup(options: { joinPolicy?: 'AUTO_ADD' | 'INVITATION_REQUIRED' } = {}) {
  const chat = buildChat({ joinPolicy: options.joinPolicy ?? 'AUTO_ADD' });
  const owner = buildParticipant({ userId: 'user-owner', role: 'OWNER' });
  const chatRepository = new FakeChatRepository({ chat, participants: [owner] });

  const userRepository = new FakeUserRepository([
    buildUser({ id: 'user-owner', firstName: 'Owner', lastName: 'Person' }),
    buildUser({ id: 'user-invitee', firstName: 'Invitee', lastName: 'Person' }),
  ]);

  const groupInvitationRepository = new FakeGroupInvitationRepository();
  const { sendNotificationUseCase, sentNotifications } = createFakeSendNotificationUseCase();

  const useCase = new InviteUserToGroupUseCase(
    chatRepository,
    userRepository,
    groupInvitationRepository,
    sendNotificationUseCase,
  );

  return { useCase, chatRepository, userRepository, groupInvitationRepository, sentNotifications };
}

describe('InviteUserToGroupUseCase', () => {
  it('adds the invitee immediately under AUTO_ADD and notifies them', async () => {
    const { useCase, chatRepository, sentNotifications } = setup({ joinPolicy: 'AUTO_ADD' });

    const result = await useCase.execute({
      chatId: 'chat-1',
      inviterUserId: 'user-owner',
      invitedUserId: 'user-invitee',
    });

    expect(result).toEqual({
      status: 'ADDED',
      invitedUserId: 'user-invitee',
      systemMessage: chatRepository.systemMessage,
    });
    expect(chatRepository.addParticipantCalls).toEqual([{ chatId: 'chat-1', userId: 'user-invitee' }]);
    expect(sentNotifications.some((n) => n.type === 'ADDED_TO_GROUP' && n.userId === 'user-invitee')).toBe(
      true,
    );
  });

  it('creates a pending invitation under INVITATION_REQUIRED instead of adding directly', async () => {
    const { useCase, chatRepository, groupInvitationRepository, sentNotifications } = setup({
      joinPolicy: 'INVITATION_REQUIRED',
    });

    const result = await useCase.execute({
      chatId: 'chat-1',
      inviterUserId: 'user-owner',
      invitedUserId: 'user-invitee',
    });

    expect(result.status).toBe('INVITED');
    expect(chatRepository.addParticipantCalls).toHaveLength(0);
    expect(groupInvitationRepository.invitations).toHaveLength(1);
    expect(sentNotifications.some((n) => n.type === 'GROUP_INVITATION')).toBe(true);
  });

  it('allows re-inviting someone who previously left the group', async () => {
    const { useCase, chatRepository } = setup({ joinPolicy: 'AUTO_ADD' });

    chatRepository.participants.push(
      buildParticipant({ userId: 'user-invitee', role: 'MEMBER', leftAt: new Date('2026-01-02T00:00:00Z') }),
    );

    await expect(
      useCase.execute({
        chatId: 'chat-1',
        inviterUserId: 'user-owner',
        invitedUserId: 'user-invitee',
      }),
    ).resolves.toMatchObject({ status: 'ADDED' });
  });

  it('rejects inviting someone who is still an active participant', async () => {
    const { useCase, chatRepository } = setup();

    chatRepository.participants.push(buildParticipant({ userId: 'user-invitee', role: 'MEMBER' }));

    await expect(
      useCase.execute({
        chatId: 'chat-1',
        inviterUserId: 'user-owner',
        invitedUserId: 'user-invitee',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects inviting yourself', async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ chatId: 'chat-1', inviterUserId: 'user-owner', invitedUserId: 'user-owner' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects a plain member trying to invite', async () => {
    const { useCase, chatRepository } = setup();

    chatRepository.participants.push(buildParticipant({ userId: 'user-member', role: 'MEMBER' }));

    await expect(
      useCase.execute({
        chatId: 'chat-1',
        inviterUserId: 'user-member',
        invitedUserId: 'user-invitee',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects a duplicate invitation while one is already pending', async () => {
    const { useCase, groupInvitationRepository } = setup({ joinPolicy: 'INVITATION_REQUIRED' });

    groupInvitationRepository.invitations.push({
      id: 'existing-invitation',
      chatId: 'chat-1',
      invitedByUserId: 'user-owner',
      invitedUserId: 'user-invitee',
      status: 'PENDING',
      createdAt: new Date(),
      respondedAt: null,
    });

    await expect(
      useCase.execute({
        chatId: 'chat-1',
        inviterUserId: 'user-owner',
        invitedUserId: 'user-invitee',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws NotFoundError when the group does not exist', async () => {
    const { useCase, chatRepository } = setup();
    chatRepository.chat = null;

    await expect(
      useCase.execute({
        chatId: 'missing-chat',
        inviterUserId: 'user-owner',
        invitedUserId: 'user-invitee',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when the invited user does not exist', async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ chatId: 'chat-1', inviterUserId: 'user-owner', invitedUserId: 'ghost-user' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
