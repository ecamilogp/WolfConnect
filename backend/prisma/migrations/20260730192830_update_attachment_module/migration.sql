/*
  Warnings:

  - You are about to drop the column `attachmentType` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `attachments` table. All the data in the column will be lost.
  - Added the required column `originalName` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."attachments" DROP COLUMN "attachmentType",
DROP COLUMN "fileUrl",
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."AttachmentType";
