/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `tb_usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `tb_usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tb_usuario` ADD COLUMN `cpf` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `tb_usuario_cpf_key` ON `tb_usuario`(`cpf`);
