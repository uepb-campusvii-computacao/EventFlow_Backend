import {
  Prisma,
  StatusPagamento,
  TipoAtividade,
  Usuario,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import UserAtividadeRepository from "./UserAtividadeRepository";

export interface ActivityUpdate {
  id: string;
  type: TipoAtividade;
}

export default class UserInscricaoRepository {
  static async createUserInscricao(
    tx: Prisma.TransactionClient,
    user_uuid: string,
    lote_id: string,
    payer_id: string,
    payment_id?: string,
    expiration_date?: string,
    status_pagamento?: StatusPagamento
  ) {
    return await tx.userInscricao.create({
      data: {
        uuid_user: user_uuid,
        uuid_lote: lote_id,
        uuid_payer: payer_id,
        id_payment_mercado_pago: payment_id || null,
        expiration_datetime: expiration_date || null,
        status_pagamento: status_pagamento,
      },
    });
  }

  public static async createManyUsersSubscriptions(
    tx: Prisma.TransactionClient,
    usersIds: string[],
    lote_id: string,
    payer_id: string,
    payment_id?: string,
    expiration_date?: string,
    status_pagamento?: StatusPagamento
  ) {
    const usersSubscriptions = await tx.userInscricao.createMany({
      data: usersIds.map((user_id) => ({
        uuid_user: user_id,
        uuid_lote: lote_id,
        uuid_payer: payer_id,
        id_payment_mercado_pago: payment_id || null,
        expiration_datetime: expiration_date || null,
        status_pagamento: status_pagamento,
      })),
    });

    return usersSubscriptions;
  }

  static async findUserInscriptionByEventId(user_id: string, event_id: string) {
    try {
      const userInscription = await prisma.userInscricao.findFirst({
        where: {
          uuid_user: user_id,
          lote: {
            uuid_evento: event_id,
          },
        },
        include: {
          usuario: true,
          lote: true,
        },
      });

      return userInscription;
    } catch (error) {
      console.error("Erro ao buscar inscrição do usuário:", error);
      throw error;
    }
  }

  static async findUserGuestSubscriptions(user_id: string, event_id: string) {
    const userSubscriptions = await prisma.userInscricao.findMany({
      where: {
        NOT: [
          {
            uuid_user: user_id,
          },
        ],
        uuid_payer: user_id,
        AND: {
          lote: {
            uuid_evento: event_id,
          },
        },
      },
    });

    return userSubscriptions;
  }

  static async findLoteIdAndUserIdByEmail(event_id: string, email: string) {
    const user = await prisma.userInscricao.findFirst({
      where: {
        lote: {
          uuid_evento: event_id,
        },
        AND: {
          usuario: {
            email,
          },
        },
      },
      select: {
        uuid_lote: true,
        uuid_user: true,
      },
    });

    return {
      uuid_user: user?.uuid_user,
      uuid_lote: user?.uuid_lote,
    };
  }

  static async findUserInscricaoByEventId(
    uuid_user: string,
    uuid_evento: string
  ) {
    //Só pode existir 1 inscrição por evento, independetemente da quantidade de lotes!

    const user_inscricao = await prisma.userInscricao.findFirstOrThrow({
      where: {
        lote: {
          uuid_evento,
        },
        AND: {
          uuid_user,
        },
      },
    });

    return user_inscricao;
  }

  static async findUserInscricaoById(uuid_user: string, uuid_lote: string) {
    const user_inscricao = await prisma.userInscricao.findUnique({
      where: {
        uuid_lote_uuid_user: {
          uuid_lote,
          uuid_user,
        },
      },
    });

    return user_inscricao;
  }

  static async findUserInscricaoByMercadoPagoId(
    id_payment_mercado_pago: string
  ) {
    const user_inscricao = await prisma.userInscricao.findFirst({
      where: {
        id_payment_mercado_pago,
      },
    });

    if (!user_inscricao) {
      throw new Error("UUID não encontrado!");
    }

    return user_inscricao;
  }

  static async findUserInscricaoByUserAndLote(userId: string, loteId: string) {
    try {
      const inscricao = await prisma.userInscricao.findUnique({
        where: {
          uuid_lote_uuid_user: {
            uuid_user: userId,
            uuid_lote: loteId,
          },
        },
      });
      return inscricao;
    } catch (error) {
      throw error;
    }
  }

  public static async findUserSubscriptionByPayerAndLote(
    payerId: string,
    loteId: string
  ) {
    try {
      const inscricao = await prisma.userInscricao.findUnique({
        where: {
          uuid_lote_uuid_user: {
            uuid_lote: loteId,
            uuid_user: payerId,
          },
          uuid_payer: payerId,
        },
      });
      return inscricao;
    } catch (error) {
      throw error;
    }
  }

  static async changeStatusPagamentoPix(
    uuid_user: string,
    uuid_lote: string,
    status_pagamento: StatusPagamento
  ) {
    await prisma.userInscricao.update({
      where: {
        uuid_lote_uuid_user: {
          uuid_user,
          uuid_lote,
        },
      },
      data: {
        status_pagamento,
      },
    });
  }
  static async changeStatusPagamentoCard(
    uuid_user: string,
    uuid_lote: string,
    status_pagamento: StatusPagamento,
    status_detail: string,
    payment_method: string,
    last_four_digits: string
  ) {
    await prisma.userInscricao.update({
      where: {
        uuid_lote_uuid_user: {
          uuid_user,
          uuid_lote,
        },
      },
      data: {
        status_pagamento,
        status_detail,
        payment_method,
        last_four_digits,
      },
    });
  }

  static async changeStatusPagamentoToREALIZADO(
    uuid_lote: string,
    uuid_user: string
  ) {
    console.log(uuid_lote, uuid_user);

    const user_inscricao = await prisma.userInscricao.update({
      where: {
        uuid_lote_uuid_user: {
          uuid_lote,
          uuid_user,
        },
      },
      data: {
        status_pagamento: "REALIZADO",
      },
    });

    return user_inscricao;
  }

  static async findAllSubscribersInEvent(event_id: string) {
    const event_exists = await prisma.evento.findUnique({
      where: {
        uuid_evento: event_id,
      },
    });

    if (!event_exists) {
      throw new Error("UUID incorreto!");
    }

    const all_subscribers = await prisma.userInscricao.findMany({
      where: {
        lote: {
          uuid_evento: event_id,
        },
      },
      select: {
        uuid_user: true,
        credenciamento: true,
        id_payment_mercado_pago: true,
        status_pagamento: true,
        usuario: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    return all_subscribers;
  }

  static async findAllEventsByUserId(uuid_user: string) {
    try {
      const eventos = await prisma.evento.findMany({
        where: {
          UserEvento: {
            some: {
              uuid_user,
            },
          },
        },
        select: {
          uuid_evento: true,
          nome: true,
          date: true,
        },
      });

      return eventos;
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      throw error;
    }
  }

  static async removeActivityIfTypeNull(
    user_id: string,
    activities: ActivityUpdate[] = []
  ) {
    const minicurso = activities.find((e) => e.type === "MINICURSO");
    const oficina = activities.find((e) => e.type === "OFICINA");
    const workshop = activities.find((e) => e.type === "WORKSHOP");
    const palestra = activities.find((e) => e.type === "PALESTRA");
    if (!minicurso) {
      UserAtividadeRepository.deleteAllActivityByUserAndType(
        user_id,
        "MINICURSO"
      );
    }
    if (!oficina) {
      UserAtividadeRepository.deleteAllActivityByUserAndType(
        user_id,
        "OFICINA"
      );
    }
    if (!workshop) {
      UserAtividadeRepository.deleteAllActivityByUserAndType(
        user_id,
        "WORKSHOP"
      );
    }
    if (!palestra) {
      UserAtividadeRepository.deleteAllActivityByUserAndType(
        user_id,
        "PALESTRA"
      );
    }
  }

  static async updateParticipante(
    user_id: string,
    nome: string,
    nome_cracha: string,
    email: string,
    instituicao: string,
    status_pagamento?: StatusPagamento,
    activities: ActivityUpdate[] = []
  ): Promise<Usuario> {
    const updatedUser = await prisma.usuario.update({
      where: { uuid_user: user_id },
      data: {
        nome,
        nome_cracha,
        email,
        instituicao,
      },
    });

    await this.removeActivityIfTypeNull(user_id, activities);

    const updateActivities = activities.map((activity) =>
      UserAtividadeRepository.replaceActivity(
        user_id,
        activity.id,
        activity.type
      )
    );

    let updatePaymentStatus;
    if (status_pagamento) {
      updatePaymentStatus = prisma.userInscricao.updateMany({
        where: {
          uuid_user: user_id,
        },
        data: {
          status_pagamento,
        },
      });
    }

    await Promise.all([...updateActivities, updatePaymentStatus]);

    return updatedUser;
  }

  static async updateUserInscricao(
    tx: Prisma.TransactionClient,
    uuid_lote: string,
    uuid_user: string,
    uuid_userInscricao: string,
    payment_id: string,
    expiration_date: string
  ) {
    const userInscricao = await tx.userInscricao.update({
      where: {
        uuid_lote_uuid_user: {
          uuid_lote,
          uuid_user,
        },
        uuid_userInscricao,
      },
      data: {
        id_payment_mercado_pago: payment_id,
        expiration_datetime: expiration_date,
      },
    });

    return userInscricao;
  }

  static async projectionTableCredenciamento(event_id: string) {
    const lotes = await prisma.lote.findMany({
      where: { uuid_evento: event_id },
      select: { uuid_lote: true },
    });

    const users = await prisma.userInscricao.findMany({
      where: {
        uuid_lote: {
          in: lotes.map((lote) => lote.uuid_lote),
        },
      },
      select: {
        usuario: {
          select: {
            uuid_user: true,
            nome: true,
            email: true,
            nome_cracha: true,
            instituicao: true,
          },
        },
        status_pagamento: true,
        uuid_lote: true,
        credenciamento: true,
      },
      orderBy: {
        usuario: {
          nome: "asc",
        },
      },
    });

    return users.map((userInscricao) => ({
      uuid_user: userInscricao.usuario.uuid_user,
      nome: userInscricao.usuario.nome,
      nome_cracha: userInscricao.usuario.nome_cracha,
      email: userInscricao.usuario.email,
      uuid_lote: userInscricao.uuid_lote,
      status_pagamento: userInscricao.status_pagamento,
      credenciamento: userInscricao.credenciamento,
      instituicao: userInscricao.usuario.instituicao,
    }));
  }

  static async getAllUsersInEvent(event_id: string) {
    try {
      const users = await prisma.userInscricao.findMany({
        where: {
          lote: {
            uuid_evento: event_id,
          },
          status_pagamento: {
            in: [StatusPagamento.REALIZADO, StatusPagamento.GRATUITO],
          },
        },
        include: {
          usuario: true,
          lote: true,
        },
      });

      return users.map((userInscricao) => ({
        uuid_user: userInscricao.usuario.uuid_user,
        nome: userInscricao.usuario.nome,
        nome_cracha: userInscricao.usuario.nome_cracha,
        email: userInscricao.usuario.email,
        status_pagamento: userInscricao.status_pagamento,
        credenciamento: userInscricao.credenciamento,
        instituicao: userInscricao.usuario.instituicao,
        lote: userInscricao.lote,
      }));
    } catch (error) {
      throw error;
    }
  }

  static async findUserInscriptionStatus(event_id: string) {
    return await prisma.userInscricao.findMany({
      where: {
        lote: {
          evento: {
            uuid_evento: event_id,
          },
        },
      },
      include: {
        lote: true,
      },
    });
  }

  static async findAllUserInEventByStatusPagamento(
    uuid_evento: string,
    status_pagamento: StatusPagamento
  ) {
    const users = await prisma.userInscricao.findMany({
      where: {
        lote: {
          evento: {
            uuid_evento,
          },
        },
        AND: {
          status_pagamento,
        },
      },
      select: {
        uuid_user: true,
        usuario: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        usuario: {
          nome: "asc",
        },
      },
    });

    return users;
  }

  static async changeCredenciamentoValue(
    uuid_user: string,
    uuid_lote: string,
    credenciamento_value: boolean
  ) {
    await prisma.userInscricao.update({
      where: {
        uuid_lote_uuid_user: {
          uuid_lote,
          uuid_user,
        },
      },
      data: {
        credenciamento: credenciamento_value,
      },
    });
  }

  static async deleteUserInscricaoWithTransaction(
    tx: Prisma.TransactionClient,
    uuid_lote: string,
    uuid_user: string
  ) {
    await tx.userInscricao.delete({
      where: {
        uuid_lote_uuid_user: {
          uuid_lote,
          uuid_user,
        },
      },
    });
  }
}
