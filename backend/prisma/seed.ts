import 'dotenv/config';

import { prisma } from '../src/infrastructure/database/prisma.service.js';
import { UserRole } from '../src/domain/entities/user.entity.js';

/**
 * Bootstraps the initial platform administrator(s).
 *
 * This is intentionally NOT reachable from inside the app: the only way to
 * create the first ADMIN is for someone with access to the server's
 * environment variables to run this script. Anyone can register an
 * account, but nobody can promote themselves to ADMIN through the API —
 * that would defeat the whole point of having a protected role.
 *
 * Once at least one ADMIN exists, further role changes go through the
 * admin-only `PATCH /users/:userId/role` endpoint (see
 * `update-user-role.use-case.ts`), which requires the requester to already
 * be an ADMIN and blocks self-role-changes.
 *
 * Usage:
 *   PLATFORM_ADMIN_EMAILS="user1@example.com,user2@example.com" npx prisma db seed
 *
 * The target user(s) must already have a registered account — this script
 * only promotes existing users, it never creates one.
 */
async function main(): Promise<void> {
  const rawEmails = process.env.PLATFORM_ADMIN_EMAILS ?? '';

  const emails = rawEmails
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  if (emails.length === 0) {
    console.log('[seed] No PLATFORM_ADMIN_EMAILS configured. Nothing to do.');
    return;
  }

  for (const email of emails) {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
      console.warn(
        `[seed] No user found with email "${email}". Register that account first, then re-run this seed.`,
      );
      continue;
    }

    if (user.role === UserRole.ADMIN) {
      console.log(`[seed] ${email} is already an administrator.`);
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN },
    });

    console.log(`[seed] ${email} promoted to administrator.`);
  }
}

main()
  .catch((error) => {
    console.error('[seed] Failed to run seed script:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
