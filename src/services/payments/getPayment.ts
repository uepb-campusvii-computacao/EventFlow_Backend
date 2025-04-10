import { StatusPagamento } from "@prisma/client";
import { createPaymentClient } from "../../lib/mercado_pago";
import EventRepository from "../../repositories/EventRepository";
import LoteRepository from "../../repositories/LoteRepository";
import OrderRepository from "../../repositories/OrderRepository";
import UserInscricaoRepository from "../../repositories/UserInscricaoRepository";
const statusPagamentoHash: { [key: string]: StatusPagamento } = {
  pending: StatusPagamento.PENDENTE,
  approved: StatusPagamento.REALIZADO,
  cancelled: StatusPagamento.CANCELADO,
  in_process: StatusPagamento.PROCESSANDO,
  rejected: StatusPagamento.REJEITADO,
  authorized: StatusPagamento.REALIZADO,
};

export async function getPaymentStatusForInscricao(
  user_id: string,
  lote_id: string
) {
  try {
    const user = await UserInscricaoRepository.findUserInscricaoByUserAndLote(
      user_id,
      lote_id
    );
    const { uuid_evento } = await LoteRepository.findLoteById(lote_id);
    const { access_token } = await EventRepository.findEventById(uuid_evento);
    const payment = createPaymentClient(access_token!);
    if (!user) {
      throw new Error("Inscrição não encontrada!");
    }

    if (!user.id_payment_mercado_pago) {
      throw new Error("Pagamento não encontrado!");
    }

    const { status, status_detail, payment_type_id, card } = await payment.get({
      id: user.id_payment_mercado_pago,
    });

    if (!status) {
      throw new Error("Status de pagamento não encontrado!");
    }

    return {
      status:
        status in statusPagamentoHash ? statusPagamentoHash[status] : undefined,
      status_detail,
      payment_type_id,
      last_four_digits: card?.last_four_digits,
    };
  } catch (error) {
    throw error;
  }
}

export async function getPaymentStatusForMultipleSubscriptions(
  payerId: string,
  loteId: string
): Promise<StatusPagamento | undefined> {
  try {
    const user =
      await UserInscricaoRepository.findUserSubscriptionByPayerAndLote(
        payerId,
        loteId
      );

    if (!user) {
      throw new Error("Inscrição não encontrada!");
    }

    if (!user.id_payment_mercado_pago) {
      throw new Error("Pagamento não encontrado!");
    }
    const { uuid_evento } = await LoteRepository.findLoteById(loteId);
    const { access_token } = await EventRepository.findEventById(uuid_evento);
    const payment = createPaymentClient(access_token!);
    const { status } = await payment.get({ id: user.id_payment_mercado_pago });

    if (!status) {
      throw new Error("Status de pagamento não encontrado!");
    }

    return status in statusPagamentoHash
      ? statusPagamentoHash[status]
      : undefined;
  } catch (error) {
    throw error;
  }
}

export async function getPaymentStatusForVenda(
  pagamento_id: string
): Promise<StatusPagamento | undefined> {
  try {
    const pagamento = await OrderRepository.findStatusPagamentoById(
      pagamento_id
    );

    if (!pagamento) {
      throw new Error("Inscrição não encontrada!");
    }

    if (!pagamento.id_payment_mercado_pago) {
      throw new Error("Pagamento não encontrado!");
    }
    const payment = createPaymentClient("TEST-ACCESS_TOKEN");
    const { status } = await payment.get({
      id: pagamento.id_payment_mercado_pago,
    });

    if (!status) {
      throw new Error("Status de pagamento não encontrado!");
    }

    return status in statusPagamentoHash
      ? statusPagamentoHash[status]
      : undefined;
  } catch (error) {
    throw error;
  }
}

export async function getPayment(payment_id: string, uuid_event: string) {
  const { access_token } = await EventRepository.findEventById(uuid_event);
  const payment = createPaymentClient(access_token!);
  const payment_data = await payment.get({ id: payment_id });

  if (!payment_data) {
    throw new Error("Pagamento não encontrado!");
  }

  const transaction_data = {
    date_created: payment_data.date_created,
    date_approved: payment_data.date_approved,
    status: payment_data.status,
    qr_code_base64:
      "data:image/png;base64," +
      payment_data.point_of_interaction?.transaction_data?.qr_code_base64,
    qr_code: payment_data.point_of_interaction?.transaction_data?.qr_code,
    ticket_url: payment_data.point_of_interaction?.transaction_data?.ticket_url,
  };

  return transaction_data;
}
