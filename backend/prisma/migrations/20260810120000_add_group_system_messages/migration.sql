-- CreateEnum
CREATE TYPE "public"."SystemEventType" AS ENUM ('PARTICIPANT_LEFT', 'PARTICIPANT_REMOVED');

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_senderId_fkey";

-- AlterTable
ALTER TABLE "public"."messages"
  ALTER COLUMN "senderId" DROP NOT NULL,
  ADD COLUMN "systemEventType" "public"."SystemEventType",
  ADD COLUMN "systemEventPayload" JSONB;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
