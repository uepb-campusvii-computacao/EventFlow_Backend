/*
  Warnings:

  - Added the required column `conteudo` to the `tb_evento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tb_evento` ADD COLUMN `conteudo` LONGTEXT NOT NULL,
    MODIFY `banner_img_url` LONGTEXT NULL;
