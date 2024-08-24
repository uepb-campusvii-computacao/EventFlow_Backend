-- AlterTable
ALTER TABLE `tb_atividade` MODIFY `descricao` TEXT NULL;

-- CreateTable
CREATE TABLE `tb_produto` (
    `uuid_produto` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `preco` DOUBLE NOT NULL,
    `estoque` INTEGER NOT NULL DEFAULT 0,
    `imagem_url` VARCHAR(191) NULL,
    `uuid_evento` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid_produto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pagamento` (
    `uuid_pagamento` VARCHAR(191) NOT NULL,
    `uuid_user` VARCHAR(191) NOT NULL,
    `id_payment_mercado_pago` VARCHAR(191) NOT NULL,
    `valor_total` DOUBLE NOT NULL,
    `status_pagamento` ENUM('PENDENTE', 'REALIZADO', 'EXPIRADO', 'GRATUITO') NOT NULL DEFAULT 'PENDENTE',
    `data_pagamento` DATETIME(3) NULL,

    PRIMARY KEY (`uuid_pagamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_venda` (
    `uuid_venda` VARCHAR(191) NOT NULL,
    `uuid_user` VARCHAR(191) NOT NULL,
    `uuid_produto` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `uuid_pagamento` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid_venda`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_produto` ADD CONSTRAINT `tb_produto_uuid_evento_fkey` FOREIGN KEY (`uuid_evento`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_venda` ADD CONSTRAINT `tb_venda_uuid_produto_fkey` FOREIGN KEY (`uuid_produto`) REFERENCES `tb_produto`(`uuid_produto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_venda` ADD CONSTRAINT `tb_venda_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_venda` ADD CONSTRAINT `tb_venda_uuid_pagamento_fkey` FOREIGN KEY (`uuid_pagamento`) REFERENCES `Pagamento`(`uuid_pagamento`) ON DELETE RESTRICT ON UPDATE CASCADE;
