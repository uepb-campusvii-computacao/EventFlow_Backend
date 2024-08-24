/*
  Warnings:

  - You are about to drop the column `uuid_user` on the `tb_evento` table. All the data in the column will be lost.
  - You are about to drop the column `atividadeUuid_atividade` on the `tb_usuario` table. All the data in the column will be lost.
  - You are about to alter the column `perfil` on the `tb_usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - The primary key for the `tb_usuario_inscricao` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid_inscricao` on the `tb_usuario_inscricao` table. All the data in the column will be lost.
  - You are about to drop the `tb_atividade_participante` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tb_inscricao` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `uuid_user_owner` to the `tb_evento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiration_datetime` to the `tb_usuario_inscricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrcode_base64` to the `tb_usuario_inscricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uuid_lote` to the `tb_usuario_inscricao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tb_atividade_participante` DROP FOREIGN KEY `tb_atividade_participante_uuid_atividade_fkey`;

-- DropForeignKey
ALTER TABLE `tb_atividade_participante` DROP FOREIGN KEY `tb_atividade_participante_uuid_user_fkey`;

-- DropForeignKey
ALTER TABLE `tb_evento` DROP FOREIGN KEY `tb_evento_uuid_user_fkey`;

-- DropForeignKey
ALTER TABLE `tb_inscricao` DROP FOREIGN KEY `tb_inscricao_uuid_evento_fkey`;

-- DropForeignKey
ALTER TABLE `tb_usuario` DROP FOREIGN KEY `tb_usuario_atividadeUuid_atividade_fkey`;

-- DropForeignKey
ALTER TABLE `tb_usuario_inscricao` DROP FOREIGN KEY `tb_usuario_inscricao_uuid_inscricao_fkey`;

-- AlterTable
ALTER TABLE `tb_evento` DROP COLUMN `uuid_user`,
    ADD COLUMN `uuid_user_owner` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tb_usuario` DROP COLUMN `atividadeUuid_atividade`,
    ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `perfil` ENUM('ADMIN', 'PARTICIPANTE') NOT NULL DEFAULT 'PARTICIPANTE';

-- AlterTable
ALTER TABLE `tb_usuario_inscricao` DROP PRIMARY KEY,
    DROP COLUMN `uuid_inscricao`,
    ADD COLUMN `expiration_datetime` DATETIME(3) NOT NULL,
    ADD COLUMN `qrcode_base64` VARCHAR(191) NOT NULL,
    ADD COLUMN `uuid_lote` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`uuid_lote`, `uuid_user`);

-- DropTable
DROP TABLE `tb_atividade_participante`;

-- DropTable
DROP TABLE `tb_inscricao`;

-- CreateTable
CREATE TABLE `tb_usuario_atividade` (
    `uuid_user` VARCHAR(191) NOT NULL,
    `uuid_atividade` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid_user`, `uuid_atividade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_evento` ADD CONSTRAINT `tb_evento_uuid_user_owner_fkey` FOREIGN KEY (`uuid_user_owner`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_atividade` ADD CONSTRAINT `tb_usuario_atividade_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_atividade` ADD CONSTRAINT `tb_usuario_atividade_uuid_atividade_fkey` FOREIGN KEY (`uuid_atividade`) REFERENCES `tb_atividade`(`uuid_atividade`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_inscricao` ADD CONSTRAINT `tb_usuario_inscricao_uuid_lote_fkey` FOREIGN KEY (`uuid_lote`) REFERENCES `tb_lote`(`uuid_lote`) ON DELETE RESTRICT ON UPDATE CASCADE;
