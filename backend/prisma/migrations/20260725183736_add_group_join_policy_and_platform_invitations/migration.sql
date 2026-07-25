/*
  Warnings:

  - You are about to drop the `invitations` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."GroupJoinPolicy" AS ENUM ('AUTO_ADD', 'INVITATION_REQUIRED');

-- CreateEnum
CREATE TYPE "public"."PlatformInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."invitations" DROP CONSTRAINT "invitations_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."invitations" DROP CONSTRAINT "invitations_invitedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."invitations" DROP CONSTRAINT "invitations_invitedUserId_fkey";

-- AlterTable
ALTER TABLE "public"."chats" ADD COLUMN     "joinPolicy" "public"."GroupJoinPolicy";

-- DropTable
DROP TABLE "public"."invitations";

-- CreateTable
CREATE TABLE "public"."group_invitations" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "invitedUserId" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "group_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."platform_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "public"."PlatformInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedByUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_invitations_chatId_idx" ON "public"."group_invitations"("chatId");

-- CreateIndex
CREATE INDEX "group_invitations_status_idx" ON "public"."group_invitations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "group_invitations_chatId_invitedUserId_key" ON "public"."group_invitations"("chatId", "invitedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_invitations_token_key" ON "public"."platform_invitations"("token");

-- CreateIndex
CREATE INDEX "platform_invitations_email_idx" ON "public"."platform_invitations"("email");

-- CreateIndex
CREATE INDEX "platform_invitations_status_idx" ON "public"."platform_invitations"("status");

-- AddForeignKey
ALTER TABLE "public"."group_invitations" ADD CONSTRAINT "group_invitations_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_invitations" ADD CONSTRAINT "group_invitations_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_invitations" ADD CONSTRAINT "group_invitations_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."platform_invitations" ADD CONSTRAINT "platform_invitations_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
