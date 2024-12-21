/*
  Warnings:

  - You are about to drop the `tb_atividade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tb_atividade` DROP FOREIGN KEY `tb_atividade_uuid_evento_fkey`;

-- DropForeignKey
ALTER TABLE `tb_usuario_atividade` DROP FOREIGN KEY `tb_usuario_atividade_uuid_atividade_fkey`;

-- DropIndex
DROP INDEX `tb_usuario_atividade_uuid_atividade_fkey` ON `tb_usuario_atividade`;

-- DropTable
DROP TABLE `tb_atividade`;

-- CreateTable
CREATE TABLE `tb_activity` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `maxParticipants` INTEGER NULL,
    `activityType` ENUM('MINICURSO', 'WORKSHOP', 'OFICINA', 'PALESTRA') NOT NULL DEFAULT 'MINICURSO',
    `numberOfRegistrations` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_activity` ADD CONSTRAINT `tb_activity_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_atividade` ADD CONSTRAINT `tb_usuario_atividade_uuid_atividade_fkey` FOREIGN KEY (`uuid_atividade`) REFERENCES `tb_activity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
