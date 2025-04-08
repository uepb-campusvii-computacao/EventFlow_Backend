/*
  Warnings:

  - The `expires_in` column on the `tb_evento` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX `tb_venda_uuid_pagamento_fkey` ON `tb_venda`;

-- AlterTable
ALTER TABLE `tb_evento` DROP COLUMN `expires_in`,
    ADD COLUMN `expires_in` INTEGER NULL;
