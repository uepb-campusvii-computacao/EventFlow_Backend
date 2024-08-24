/*
  Warnings:

  - You are about to drop the column `ativ` on the `tb_lote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tb_lote` DROP COLUMN `ativ`,
    ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true;
