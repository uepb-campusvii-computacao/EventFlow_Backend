/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `tb_evento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `tb_atividade` ADD COLUMN `date` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `tb_evento` ADD COLUMN `date` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `tb_evento_nome_key` ON `tb_evento`(`nome`);
