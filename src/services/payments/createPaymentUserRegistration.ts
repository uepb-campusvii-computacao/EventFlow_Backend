import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { createPaymentClient } from "../../lib/mercado_pago";
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
  uuid_userInscricao: string,
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

  const event = await tx.evento.findUnique({
    where: {
      uuid_evento: lote.uuid_evento,
    },
  });

  const payment = createPaymentClient(event?.access_token!);
  const currentDate = dayjs();
  const date_of_expirationPix = currentDate
    .add(15, "minute")
    .format("YYYY-MM-DDTHH:mm:ss.000-03:00");
  const date_of_expirationCard = currentDate
    .add(10, "day")
    .format("YYYY-MM-DDTHH:mm:ss.000-03:00");
  
  
  const pix_price = parseFloat((lote.preco + lote.preco * 0.0099 + lote.preco * 0.03).toFixed(2));
  const card_price = parseFloat((lote.preco + lote.preco * 0.0498 + lote.preco * 0.0099).toFixed(2));

  const pixBody = () => ({
    additional_info: {
      items: [
        {
          id: lote.uuid_lote,
          title: lote.nome,
          category_id: "tickets",
          description: lote.descricao ?? undefined,
          quantity: 1,
          unit_price: pix_price,
        },
      ],
      payer: {
        first_name: user.nome.split(" ")[0],
        last_name: user.nome.split(" ")[1],
      },
    },
    application_fee: 1,
    external_reference: uuid_userInscricao,
    statement_descriptor: lote.descricao ?? undefined,
    transaction_amount: pix_price,
    description: "Compra de ingresso",
    payment_method_id: "pix",
    date_of_expiration: date_of_expirationPix,
    notification_url: `${process.env.API_URL}/lote/${lote_id}/user/${user_uuid}/payment/updateStatusPix`,
    payer: {
      email: user.email,
    },
  });

  const cardBody = () => ({
    additional_info: {
      items: [
        {
          id: lote.uuid_lote,
          title: lote.nome,
          category_id: "tickets",
          description: lote.descricao ?? undefined,
          quantity: 1,
          unit_price: card_price,
        },
      ],
      payer: {
        first_name: user.nome.split(" ")[0],
        last_name: user.nome.split(" ")[1],
      },
    },
    application_fee: 1,
    statement_descriptor: lote.descricao ?? undefined,
    external_reference: uuid_userInscricao,
    transaction_amount: card_price,
    description: "Compra de ingresso",
    payment_method_id: (paymentInfo as PaymentInfo).payment_method_id,
    date_of_expiration: date_of_expirationCard,
    notification_url: `${process.env.API_URL}/lote/${lote_id}/user/${user_uuid}/payment/updateStatusCard`,
    payer: (paymentInfo as PaymentInfo).payer,
    installments: (paymentInfo as PaymentInfo).installments,
    token: (paymentInfo as PaymentInfo).token,
  });

  const body = paymentInfo ? cardBody() : pixBody();

  const requestOptions = {
    idempotencyKey: `${uuid_userInscricao}`,
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

export async function createPaymentMultipleUsersResgistration(
  tx: Prisma.TransactionClient,
  usersIds: string[],
  lote_id: string,
  paymentInfo?: PaymentInfo
) {
  const users = await tx.usuario.findMany({
    where: {
      uuid_user: {
        in: usersIds,
      },
    },
  });

  if (!users || users.length < usersIds.length) {
    throw new Error("Não foi possível encontrar todos os usuários");
  }

  const lote = await tx.lote.findUnique({
    where: {
      uuid_lote: lote_id,
    },
  });

  if (!lote) {
    throw new Error("Lote não encontrado");
  }
  
  const event = await tx.evento.findUnique({
    where: {
      uuid_evento: lote.uuid_evento,
    },
  });

  const payment = createPaymentClient(event?.access_token!);
  const current_date = dayjs();
  const date_of_expirationPix = current_date.add(5, "minute");
  const date_of_expirationCard = current_date.add(10, "day");
  const quantTickets = usersIds.length;
  const finalPrice = lote.preco * quantTickets;
  const payer = users.filter(
    (user) => user.uuid_user == usersIds[usersIds.length - 1]
  )[0];
  const usersIdsJoined = usersIds.join(";");

  const pixBody = () => {
    return {
      transaction_amount: finalPrice,
      description: `Compra de ${quantTickets} ingressos`,
      payment_method_id: "pix",
      date_of_expiration: date_of_expirationPix.toISOString(),
      notification_url: `${process.env.API_URL}/lote/${lote_id}/user/${usersIdsJoined}/realizar-pagamento`,
      payer: {
        email: payer.email,
      },
    };
  };

  const cardBody = () => {
    return {
      transaction_amount: finalPrice,
      description: `Compra de ${quantTickets} ingressos`,
      payment_method_id: (paymentInfo as PaymentInfo).payment_method_id,
      date_of_expiration: date_of_expirationCard.toISOString(),
      notification_url: `${process.env.API_URL}/lote/${lote_id}/user/${usersIdsJoined}/realizar-pagamento`,
      payer: (paymentInfo as PaymentInfo).payer,
      installments: (paymentInfo as PaymentInfo).installments,
      token: (paymentInfo as PaymentInfo).token,
    };
  };

  const body = paymentInfo ? cardBody() : pixBody();
  const requestOptions = {
    idempotencyKey: `${usersIds.join("-")}-${lote_id}`,
  };

  console.log(body, requestOptions);

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
