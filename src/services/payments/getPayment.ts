import { StatusPagamento } from "@prisma/client";
import { payment } from "../../lib/mercado_pago";
import OrderRepository from "../../repositories/OrderRepository";
import UserInscricaoRepository from "../../repositories/UserInscricaoRepository";
const statusPagamentoHash: { [key: string]: StatusPagamento } = {
  'pending': StatusPagamento.PENDENTE,
  'approved': StatusPagamento.REALIZADO,
  'cancelled': StatusPagamento.EXPIRADO
};

export async function getPayment(payment_id: string) {
  
  const payment_data = await payment.get({ id: payment_id })

  if (!payment_data) {
    throw new Error("Pagamento não encontrado!");
  }

  const transaction_data = {
    date_created: payment_data.date_created,
    date_approved: payment_data.date_approved,
    status: payment_data.status,
    qr_code_base64: "data:image/png;base64,"+payment_data.point_of_interaction?.transaction_data?.qr_code_base64,
    qr_code: payment_data.point_of_interaction?.transaction_data?.qr_code,
    ticket_url: payment_data.point_of_interaction?.transaction_data?.ticket_url
  }

  return transaction_data;
}

export async function getPaymentStatusForInscricao(user_id: string, lote_id: string): Promise<StatusPagamento | undefined> {
  try {
    const user = await UserInscricaoRepository.findUserInscricaoByUserAndLote(user_id, lote_id);

    if (!user) {
      throw new Error("Inscrição não encontrada!");
    }

    if (!user.id_payment_mercado_pago) {
      throw new Error("Pagamento não encontrado!");
    }

    const { status } = await payment.get({ id: user.id_payment_mercado_pago });
    if (!status) {
      throw new Error("Status de pagamento não encontrado!");
    }

    return status in statusPagamentoHash ? statusPagamentoHash[status] : undefined;
  } catch (error) {
    throw error;
  }
}

export async function getPaymentStatusForVenda(pagamento_id : string): Promise<StatusPagamento | undefined> {
  try {
    const pagamento = await OrderRepository.findStatusPagamentoById(pagamento_id);

    if (!pagamento) {
      throw new Error("Inscrição não encontrada!");
    }

    if (!pagamento.id_payment_mercado_pago) {
      throw new Error("Pagamento não encontrado!");
    }

    const { status } = await payment.get({ id: pagamento.id_payment_mercado_pago });

    if (!status) {
      throw new Error("Status de pagamento não encontrado!");
    }

    return status in statusPagamentoHash ? statusPagamentoHash[status] : undefined;
  } catch (error) {
    throw error;
  }
}
