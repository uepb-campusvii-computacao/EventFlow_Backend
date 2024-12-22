/*
  Warnings:

  - You are about to drop the `tb_usuario_atividade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tb_usuario_atividade` DROP FOREIGN KEY `tb_usuario_atividade_uuid_atividade_fkey`;

-- DropForeignKey
ALTER TABLE `tb_usuario_atividade` DROP FOREIGN KEY `tb_usuario_atividade_uuid_user_fkey`;

-- DropTable
DROP TABLE `tb_usuario_atividade`;

-- CreateTable
CREATE TABLE `tb_user_activity` (
    `userId` VARCHAR(191) NOT NULL,
    `activityId` VARCHAR(191) NOT NULL,
    `isPresent` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`userId`, `activityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_user_activity` ADD CONSTRAINT `tb_user_activity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_user_activity` ADD CONSTRAINT `tb_user_activity_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `tb_activity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
