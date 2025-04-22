import { StatusPagamento } from "@prisma/client";
import { Request, Response } from "express";
import { CreateOrderParams } from "../interfaces/createOrderParams";
import OrderRepository from "../repositories/OrderRepository";
import UserInscricaoRepository from "../repositories/UserInscricaoRepository";
import { createPaymentMarketPlace } from "../services/payments/createPaymentMarketPlace";
import {
  getPayment,
  getPaymentStatusForVenda,
} from "../services/payments/getPayment";

export async function createOrder(req: Request, res: Response) {
  try {
    const bodyParams: CreateOrderParams = req.body;

    const response = await createPaymentMarketPlace(bodyParams);

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
    return res.status(400).send(error);
  }
}

export async function getOrders(req: Request, res: Response) {
  try {
    const { user_id } = req.params;

    const vendas = await OrderRepository.findAllVendasByUserId(user_id);

    // Mapear as vendas para obter os detalhes do pagamento de forma assíncrona
    const response = await Promise.all(
      vendas.map(async (item) => {
        const data = await getPayment(
          item.uuid_pagamento,
          item.produto.uuid_evento
        );

        return {
          ...item.pagamento,
          transaction_data: data,
        };
      })
    );

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
    return res.status(400).send(error);
  }
}

export async function getOrdersByUserAndProduct(req: Request, res: Response) {
  try {
    const { user_id, produto_id } = req.params;

    const orders = await OrderRepository.findOrderByUserIdAndProductId(
      user_id,
      produto_id
    );

    return res.status(200).json(
      orders.map((item) => ({
        data_criacao: item.data_criacao,
        data_pagamento: item.data_pagamento,
        status_pagamento: item.vendas[0].pagamento.status_pagamento,
        quantidade: item.vendas[0].quantidade,
        valor_total: item.valor_total,
      }))
    );
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
    return res.status(400).send(error);
  }
}

export async function realizarPagamentoVenda(req: Request, res: Response) {
  try {
    const { pagamento_id } = req.params;
    const { action } = req.body;

    if (action === "payment.updated") {
      const [status, user_inscricao] = await Promise.all([
        getPaymentStatusForVenda(pagamento_id),
        UserInscricaoRepository.findUserInscricaoByMercadoPagoId(pagamento_id),
      ]);

      if (
        status &&
        user_inscricao?.status_pagamento !== StatusPagamento.GRATUITO
      ) {
        console.log(status, user_inscricao?.status_pagamento);
        await OrderRepository.changeVendaStatusPagamento(pagamento_id, status);
      }
    }

    return res.status(200).send("Valor alterado");
  } catch (error) {
    return res.status(400).send("Informações inválidas");
  }
}
