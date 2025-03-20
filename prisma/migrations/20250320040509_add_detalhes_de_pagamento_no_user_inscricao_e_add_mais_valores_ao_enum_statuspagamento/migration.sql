/*
  Warnings:

  - The values [EXPIRADO] on the enum `tb_pagamento_status_pagamento` will be removed. If these variants are still used in the database, this will fail.
  - The values [EXPIRADO] on the enum `tb_pagamento_status_pagamento` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `tb_pagamento` MODIFY `status_pagamento` ENUM('PENDENTE', 'PROCESSANDO', 'REALIZADO', 'CANCELADO', 'REJEITADO', 'GRATUITO') NOT NULL DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE `tb_usuario_inscricao` ADD COLUMN `last_four_digits` VARCHAR(191) NULL,
    ADD COLUMN `payment_method` VARCHAR(191) NULL,
    ADD COLUMN `status_detail` VARCHAR(191) NULL,
    MODIFY `status_pagamento` ENUM('PENDENTE', 'PROCESSANDO', 'REALIZADO', 'CANCELADO', 'REJEITADO', 'GRATUITO') NOT NULL DEFAULT 'PENDENTE';
