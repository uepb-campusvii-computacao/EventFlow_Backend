import { StatusPagamento } from "@prisma/client";

export interface UpdatePaymentStatusParams {
    status_pagamento: StatusPagamento
}