-- CreateTable
CREATE TABLE `tb_usuario` (
    `uuid_user` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `nome_cracha` VARCHAR(191) NOT NULL,
    `instituicao` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NULL,
    `perfil` VARCHAR(191) NOT NULL DEFAULT 'PARTICIPANTE',
    `atividadeUuid_atividade` VARCHAR(191) NULL,

    UNIQUE INDEX `tb_usuario_nome_cracha_key`(`nome_cracha`),
    UNIQUE INDEX `tb_usuario_email_key`(`email`),
    PRIMARY KEY (`uuid_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_evento` (
    `uuid_evento` VARCHAR(191) NOT NULL,
    `uuid_user` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid_evento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_lote` (
    `uuid_lote` VARCHAR(191) NOT NULL,
    `uuid_evento` VARCHAR(191) NOT NULL,
    `preco` DOUBLE NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    PRIMARY KEY (`uuid_lote`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_atividade` (
    `uuid_atividade` VARCHAR(191) NOT NULL,
    `uuid_evento` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `max_participants` INTEGER NULL,

    PRIMARY KEY (`uuid_atividade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_inscricao` (
    `uuid_inscricao` VARCHAR(191) NOT NULL,
    `uuid_evento` VARCHAR(191) NOT NULL,
    `preco` DOUBLE NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    PRIMARY KEY (`uuid_inscricao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_usuario_inscricao` (
    `uuid_inscricao` VARCHAR(191) NOT NULL,
    `uuid_user` VARCHAR(191) NOT NULL,
    `id_payment_mercado_pago` VARCHAR(191) NOT NULL,
    `status_pagamento` ENUM('PENDENTE', 'REALIZADO', 'EXPIRADO') NOT NULL DEFAULT 'PENDENTE',

    PRIMARY KEY (`uuid_inscricao`, `uuid_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_atividade_participante` (
    `uuid_user` VARCHAR(191) NOT NULL,
    `uuid_atividade` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid_user`, `uuid_atividade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_usuario` ADD CONSTRAINT `tb_usuario_atividadeUuid_atividade_fkey` FOREIGN KEY (`atividadeUuid_atividade`) REFERENCES `tb_atividade`(`uuid_atividade`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_evento` ADD CONSTRAINT `tb_evento_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_lote` ADD CONSTRAINT `tb_lote_uuid_evento_fkey` FOREIGN KEY (`uuid_evento`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_atividade` ADD CONSTRAINT `tb_atividade_uuid_evento_fkey` FOREIGN KEY (`uuid_evento`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_inscricao` ADD CONSTRAINT `tb_inscricao_uuid_evento_fkey` FOREIGN KEY (`uuid_evento`) REFERENCES `tb_evento`(`uuid_evento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_inscricao` ADD CONSTRAINT `tb_usuario_inscricao_uuid_inscricao_fkey` FOREIGN KEY (`uuid_inscricao`) REFERENCES `tb_inscricao`(`uuid_inscricao`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_usuario_inscricao` ADD CONSTRAINT `tb_usuario_inscricao_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_atividade_participante` ADD CONSTRAINT `tb_atividade_participante_uuid_user_fkey` FOREIGN KEY (`uuid_user`) REFERENCES `tb_usuario`(`uuid_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_atividade_participante` ADD CONSTRAINT `tb_atividade_participante_uuid_atividade_fkey` FOREIGN KEY (`uuid_atividade`) REFERENCES `tb_atividade`(`uuid_atividade`) ON DELETE RESTRICT ON UPDATE CASCADE;
