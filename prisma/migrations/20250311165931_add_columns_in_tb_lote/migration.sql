/*
  Warnings:

  - Added the required column `inscricoes` to the `tb_lote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_inscricoes` to the `tb_lote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tb_lote` ADD COLUMN `inscricoes` INTEGER NOT NULL,
    ADD COLUMN `max_inscricoes` INTEGER NOT NULL;
