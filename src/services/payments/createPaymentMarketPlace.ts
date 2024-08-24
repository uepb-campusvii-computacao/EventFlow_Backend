import { addDays, format } from "date-fns";
import { payment } from "../../lib/mercado_pago";
import { CreateOrderParams } from "../../interfaces/createOrderParams";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export async function createPaymentMarketPlace({
  email,
  produtos,
}: CreateOrderParams) {
  return await prisma.$transaction(
    async (tx) => {
      const usuario = await tx.usuario.findFirst({
        where: {
          email: email,
          userInscricao: {
            some: {
              status_pagamento: "REALIZADO",
            },
          },
        },
      });

      if (!usuario) {
        throw new Error("Email inválido ou não possui inscrição paga.");
      }

      if (!produtos || produtos.length === 0) {
        throw new Error("Pelo menos um produto deve ser fornecido.");
      }

      const pagamento = await tx.pagamento.create({
        data: {
          uuid_user: usuario.uuid_user,
          valor_total: 0,
          id_payment_mercado_pago: "",
        },
      });

      let precoTotal = 0;

      for (const { uuid_produto, quantidade } of produtos) {

        // Busca o produto
        const produto = await tx.produto.findUnique({
          where: {
            uuid_produto: uuid_produto,
          },
        });

        // Verifica se há estoque suficiente
        if (!produto || produto.estoque < quantidade) {
          throw new Error(
            "Estoque insuficiente para o produto: " + produto?.nome
          );
        }

        await tx.produto.update({
          where: {
            uuid_produto: produto.uuid_produto
          },
          data: {
            estoque: produto.estoque - quantidade
          }
        })

        precoTotal += produto.preco * quantidade;

        await tx.venda.create({
          data: {
            uuid_produto: produto.uuid_produto,
            uuid_user: usuario.uuid_user,
            quantidade,
            uuid_pagamento: pagamento.uuid_pagamento,
          },
        });
      }

      const current_date = new Date();
      const date_of_expiration = addDays(current_date, 10);

      const body = {
        transaction_amount: precoTotal, // Correção: usar precoTotal calculado
        description: `Compra de produtos`,
        payment_method_id: "pix",
        date_of_expiration: format(
          date_of_expiration,
          "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        ),
        notification_url: `${process.env.API_URL}/marketplace/${pagamento.uuid_pagamento}/realizar-pagamento`,
        payer: {
          email: email, // Correção: usar o email fornecido
        },
      };

      const requestOptions = {
        idempotencyKey: `${usuario.uuid_user}-${pagamento.uuid_pagamento}`, // Correção: use o UUID do usuário e do primeiro produto (supondo que seja válido)
      };

      try {
        const response = await payment.create({
          body,
          requestOptions,
        });

        return await tx.pagamento.update({
          where: {
            uuid_pagamento: pagamento.uuid_pagamento,
          },
          data: {
            valor_total: precoTotal,
            id_payment_mercado_pago: response.id!.toString(),
          },
        });
      } catch (error) {
        console.log(error);
        throw new Error("Erro ao criar o pagamento");
      }
    },
    {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
    }
  );
}
