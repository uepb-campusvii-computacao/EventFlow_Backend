-- CreateTable
CREATE TABLE `tb_usuario` (
    `uuid_user` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `nome_cracha` VARCHAR(191) NOT NULL,
    `instituicao` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `passwordResetToken` VARCHAR(191) NULL,
    `passwordResetExpires` DATETIME(3) NULL,

    UNIQUE INDEX `tb_usuario_email_key`(`email`),
    PRIMARY KEY (`uuid_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_evento` (
    `uuid_evento` VARCHAR(191) NOT NULL,
    `uuid_user_owner` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `banner_img_url` LONGTEXT NULL,
    `date` DATETIME(3) NULL,
    `conteudo` LONGTEXT NOT NULL,

    UNIQUE INDEX `tb_evento_nome_key`(`nome`),
    PRIMARY KEY (`uuid_evento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_batch` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_atividade` (
    `uuid_atividade` VARCHAR(191) NOT NULL,
    `uuid_evento` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `max_participants` INTEGER NULL,
    `tipo_atividade` ENUM('MINICURSO', 'WORKSHOP', 'OFICINA', 'PALESTRA') NOT NULL DEFAULT 'MINICURSO',

    PRIMARY KEY (`uuid_atividade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_user_evento` (
    `uuid_user` VARCHAR(191) NOT NULL,
    `uuid_evento` VARCHAR(191) NOT NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `perfil` ENUM('ADMINISTRADOR', 'PARTICIPANTE', 'ORGANIZADOR') NOT NULL DEFAULT 'PARTICIPANTE',

    PRIMARY KEY (`uuid_user`, `uuid_evento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_usuario_atividade` (
    `uuid_user` VARCHAR(191) NOT NULL,
    `uuid_atividade` VARCHAR(191) NOT NULL,
    `presenca` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`uuid_user`, `uuid_atividade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_usuario_inscricao` (
    `uuid_user` VARCHAR(191) NOT NULL,
    `uuid_lote` VARCHAR(191) NOT NULL,
    `credenciamento` BOOLEAN NOT NULL DEFAULT false,
    `id_payment_mercado_pago` VARCHAR(191) NULL,
    `expiration_datetime` DATETIME(3) NULL,
    `status_pagamento` ENUM('PENDENTE', 'REALIZADO', 'EXPIRADO', 'GRATUITO') NOT NULL DEFAULT 'PENDENTE',

    PRIMARY KEY (`uuid_lote`, `uuid_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `tb_pagamento` (
    `uuid_pagamento` VARCHAR(191) NOT NULL,
    `uuid_user` VARCHAR(191) NOT NULL,
    `id_payment_mercado_pago` VARCHAR(191) NOT NULL,
    `valor_total` DOUBLE NOT NULL,
    `status_pagamento` ENUM('PENDENTE', 'REALIZADO', 'EXPIRADO', 'GRATUITO') NOT NULL DEFAULT 'PENDENTE',
    `data_pagamento` DATETIME(3) NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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
ALTER TABLE `tb_evento` ADD CONSTRAINT `tb_evento_uuid_user_owner_fkey` FOREIGN KEY (`uuid_user_owner`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_batch` ADD CONSTRAINT `tb_batch_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_atividade` ADD CONSTRAINT `tb_atividade_uuid_evento_fkey` FOREIGN KEY (`uuid_evento`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_user_evento` ADD CONSTRAINT `tb_user_evento_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_user_evento` ADD CONSTRAINT `tb_user_evento_uuid_evento_fkey` FOREIGN KEY (`uuid_evento`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_atividade` ADD CONSTRAINT `tb_usuario_atividade_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_atividade` ADD CONSTRAINT `tb_usuario_atividade_uuid_atividade_fkey` FOREIGN KEY (`uuid_atividade`) REFERENCES `tb_atividade`(`uuid_atividade`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_inscricao` ADD CONSTRAINT `tb_usuario_inscricao_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_inscricao` ADD CONSTRAINT `tb_usuario_inscricao_uuid_lote_fkey` FOREIGN KEY (`uuid_lote`) REFERENCES `tb_batch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_produto` ADD CONSTRAINT `tb_produto_uuid_evento_fkey` FOREIGN KEY (`uuid_evento`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_pagamento` ADD CONSTRAINT `tb_pagamento_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_venda` ADD CONSTRAINT `tb_venda_uuid_produto_fkey` FOREIGN KEY (`uuid_produto`) REFERENCES `tb_produto`(`uuid_produto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_venda` ADD CONSTRAINT `tb_venda_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_venda` ADD CONSTRAINT `tb_venda_uuid_pagamento_fkey` FOREIGN KEY (`uuid_pagamento`) REFERENCES `tb_pagamento`(`uuid_pagamento`) ON DELETE RESTRICT ON UPDATE CASCADE;
