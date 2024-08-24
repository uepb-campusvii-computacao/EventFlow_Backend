import { StatusPagamento } from "@prisma/client";
import { prisma } from "../lib/prisma";

export default class OrderRepository {
  static async findAllVendasByUserId(uuid_user: string) {
    const response = prisma.venda.findMany({
      where: {
        uuid_user,
      },
      distinct: ["uuid_pagamento"],
      orderBy: {
        pagamento: {
          data_criacao: "desc",
        },
      },
      select: {
        pagamento: {
          select: {
            uuid_user: true,
            uuid_pagamento: true,
            data_criacao: true,
            id_payment_mercado_pago: true,
            status_pagamento: true,
            valor_total: true,
            usuario: {
              select: {
                nome: true,
              },
            },
            vendas: {
              select: {
                quantidade: true,
                produto: {
                  select: {
                    uuid_produto: true,
                    nome: true,
                    preco: true,
                    imagem_url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return response;
  }

  static async findStatusPagamentoById(pagamentoId: string) {
    try {
      const pagamento = await prisma.pagamento.findUnique({
        where: {
          uuid_pagamento: pagamentoId,
        },
        select: {
          id_payment_mercado_pago: true,
        },
      });
      return pagamento;
    } catch (error) {
      throw error;
    }
  }

  static async findPagamentoById(uuid_pagamento: string) {
    const response = prisma.venda.findFirst({
      where: {
        uuid_pagamento,
      },
      distinct: ["uuid_pagamento"],
      select: {
        user: {
          select: {
            nome: true,
          },
        },
        pagamento: {
          select: {
            uuid_pagamento: true,
            id_payment_mercado_pago: true,
            status_pagamento: true,
            valor_total: true,
            vendas: {
              select: {
                quantidade: true,
                produto: {
                  select: {
                    uuid_produto: true,
                    nome: true,
                    preco: true,
                    imagem_url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!response) {
      throw new Error("Erro ao buscar pagamento");
    }

    return response;
  }

  static async getTotalValueVendasByEvento(idEvento: string) {
    const vendas = await prisma.venda.findMany({
      where: {
        produto: {
          evento: {
            uuid_evento: idEvento,
          },
        },
        pagamento: {
          status_pagamento: "REALIZADO",
        },
      },
      select: {
        pagamento: {
          select: {
            valor_total: true,
          },
        },
      },
    });

    const valorTotalVendas = vendas.reduce(
      (acc, venda) => acc + venda.pagamento.valor_total,
      0
    );

    return valorTotalVendas;
  }

  static async changeVendaStatusPagamento(
    uuid_pagamento: string,
    status_pagamento: StatusPagamento
  ) {
    const current_date = new Date();

    await prisma.pagamento.update({
      where: {
        uuid_pagamento,
      },
      data: {
        data_pagamento: current_date,
        status_pagamento,
      },
    });
  }

  static async findOrderByUserIdAndProductId(
    uuid_user: string,
    uuid_produto: string
  ) {
    const orders = await prisma.pagamento.findMany({
      where: {
        uuid_user,
        AND: {
          vendas: {
            some: {
              uuid_produto,
            },
          },
        },
      },
      select: {
        data_criacao: true,
        data_pagamento: true,
        vendas: {
          select: {
            quantidade: true,
            pagamento: {
              select: {
                status_pagamento: true,
              },
            },
          },
          take: 1,
        },
        valor_total: true,
      },
    });

    return orders;
  }
}
