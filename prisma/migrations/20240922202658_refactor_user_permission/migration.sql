/*
  Warnings:

  - You are about to drop the column `perfil` on the `tb_usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tb_usuario` DROP COLUMN `perfil`;

-- CreateTable
CREATE TABLE `tb_user_evento` (
    `uuid_user` VARCHAR(191) NOT NULL,
    `uuid_evento` VARCHAR(191) NOT NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `perfil` ENUM('ADMINISTRADOR', 'PARTICIPANTE', 'ORGANIZADOR') NOT NULL DEFAULT 'PARTICIPANTE',

    PRIMARY KEY (`uuid_user`, `uuid_evento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_user_evento` ADD CONSTRAINT `tb_user_evento_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_user_evento` ADD CONSTRAINT `tb_user_evento_uuid_evento_fkey` FOREIGN KEY (`uuid_evento`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;
