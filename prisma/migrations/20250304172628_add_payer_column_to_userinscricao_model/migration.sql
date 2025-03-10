/*
  Warnings:

  - Added the required column `uuid_payer` to the `tb_usuario_inscricao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tb_usuario_inscricao` ADD COLUMN `uuid_payer` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `tb_usuario_inscricao` ADD CONSTRAINT `tb_usuario_inscricao_uuid_payer_fkey` FOREIGN KEY (`uuid_payer`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
