/*
  Warnings:

  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Tag_questionId_fkey` ON `tag`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `name` VARCHAR(191) NOT NULL;
