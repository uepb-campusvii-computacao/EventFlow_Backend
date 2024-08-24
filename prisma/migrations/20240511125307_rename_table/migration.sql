/*
  Warnings:

  - You are about to drop the `Pagamento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Pagamento` DROP FOREIGN KEY `Pagamento_uuid_user_fkey`;

-- DropForeignKey
ALTER TABLE `tb_venda` DROP FOREIGN KEY `tb_venda_uuid_pagamento_fkey`;

-- DropTable
DROP TABLE `Pagamento`;

-- CreateTable
CREATE TABLE `tb_pagamento` (
    `uuid_pagamento` VARCHAR(191) NOT NULL,
    `uuid_user` VARCHAR(191) NOT NULL,
    `id_payment_mercado_pago` VARCHAR(191) NOT NULL,
    `valor_total` DOUBLE NOT NULL,
    `status_pagamento` ENUM('PENDENTE', 'REALIZADO', 'EXPIRADO', 'GRATUITO') NOT NULL DEFAULT 'PENDENTE',
    `data_pagamento` DATETIME(3) NULL,

    PRIMARY KEY (`uuid_pagamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_pagamento` ADD CONSTRAINT `tb_pagamento_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_venda` ADD CONSTRAINT `tb_venda_uuid_pagamento_fkey` FOREIGN KEY (`uuid_pagamento`) REFERENCES `tb_pagamento`(`uuid_pagamento`) ON DELETE RESTRICT ON UPDATE CASCADE;
