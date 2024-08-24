-- AlterTable
ALTER TABLE `tb_usuario_inscricao` MODIFY `status_pagamento` ENUM('PENDENTE', 'REALIZADO', 'EXPIRADO', 'GRATUITO') NOT NULL DEFAULT 'PENDENTE';
