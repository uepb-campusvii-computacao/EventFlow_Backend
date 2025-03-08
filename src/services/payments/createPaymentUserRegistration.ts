import { Prisma } from "@prisma/client";
import { payment } from "../../lib/mercado_pago";
import dayjs from "dayjs";
export type PaymentInfo = {
  token: string;
  payment_method_id: string;
  installments: number;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
};

export async function createPaymentUserResgistration(
  tx: Prisma.TransactionClient,
  user_uuid: string,
  lote_id: string,
  paymentInfo?: PaymentInfo
) {
  const user = await tx.usuario.findUnique({
    where: {
      uuid_user: user_uuid,
    },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const lote = await tx.lote.findUnique({
    where: {
      uuid_lote: lote_id,
    },
  });

  if (!lote) {
    throw new Error("Lote não encontrado");
  }

  const currentDate = dayjs();
  const date_of_expirationPix = currentDate.add(5, "minute");
  const date_of_expirationCard = currentDate.add(10, "day");
  
  const pixBody = () => {
    return {
      transaction_amount: lote.preco,
      description: "Compra de ingresso",
      payment_method_id: "pix",
      date_of_expiration: date_of_expirationPix.toISOString(),
      notification_url: `${process.env.API_URL}/lote/${lote_id}/user/${user_uuid}/realizar-pagamento`,
      payer: {
        email: user.email,
      },
    };
  };
  const cardBody = () => {
    return {
      transaction_amount: lote.preco,
      description: "Compra de ingresso",
      payment_method_id: (paymentInfo as PaymentInfo).payment_method_id,
      date_of_expiration: date_of_expirationCard.toISOString(),
      notification_url: `${process.env.API_URL}/lote/${lote_id}/user/${user_uuid}/realizar-pagamento`,
      payer: (paymentInfo as PaymentInfo).payer,
      installments: (paymentInfo as PaymentInfo).installments,
      token: (paymentInfo as PaymentInfo).token,
    };
  };

  const body = paymentInfo ? cardBody() : pixBody();
  const requestOptions = {
    idempotencyKey: `${user_uuid}-${lote_id}`,
  };

  try {
    const response = await payment.create({
      body,
      requestOptions,
    });

    return {
      payment_id: response.id!.toString(),
      expiration_date: response.date_of_expiration!,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Erro ao criar o pagamento");
  }
}
