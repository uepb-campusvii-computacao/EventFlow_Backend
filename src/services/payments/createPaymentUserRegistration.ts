import { Prisma } from "@prisma/client";
import { addDays, format } from "date-fns";
import { payment } from "../../lib/mercado_pago";

export async function createPaymentUserResgistration(
  tx: Prisma.TransactionClient,
  user_uuid: string,
  lote_id: string
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

  const current_date = new Date();
  const date_of_expiration = addDays(current_date, 10);

  /* caso seja cartão adicionar os dados provenientes do front
    {token: 'SEU_TOKEN_DO_CARTAO',
    description: 'Descrição do produto',
    installments: 1,
    payment_method_id: 'visa',} no body
  */
  const body = {
    transaction_amount: lote.preco,
    description: "Compra de ingresso",
    payment_method_id: "pix",
    date_of_expiration: format(
      date_of_expiration,
      "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    ),
    notification_url: `${process.env.API_URL}/lote/${lote_id}/user/${user_uuid}/realizar-pagamento`,
    payer: {
      email: user.email,
    },
  };

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

export async function createPaymentMultipleUsersResgistration(
  tx: Prisma.TransactionClient,
  usersIds: string[],
  lote_id: string
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

  const current_date = new Date();
  const date_of_expiration = addDays(current_date, 10);
  const quantTickets = usersIds.length;
  const finalPrice = lote.preco * quantTickets;
  const payer = users.filter(
    (user) => user.uuid_user == usersIds[usersIds.length - 1]
  )[0];

  /* caso seja cartão adicionar os dados provenientes do front
    {token: 'SEU_TOKEN_DO_CARTAO',
    description: 'Descrição do produto',
    installments: 1,
    payment_method_id: 'visa',} no body
  */
  const body = {
    transaction_amount: finalPrice,
    description: `Compra de ${quantTickets} ingressos`,
    payment_method_id: "pix",
    date_of_expiration: format(
      date_of_expiration,
      "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    ),
    notification_url: `${
      process.env.API_URL
    }/lote/${lote_id}/multiple-users/${usersIds.join(";")}/realizar-pagamento`,
    payer: {
      email: payer.email,
    },
  };

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
