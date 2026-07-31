-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "replyToMessageId" TEXT;

-- CreateIndex
CREATE INDEX "messages_replyToMessageId_idx" ON "public"."messages"("replyToMessageId");

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_replyToMessageId_fkey" FOREIGN KEY ("replyToMessageId") REFERENCES "public"."messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
