import { Prisma } from "@prisma/client";
import slugify from "slugify";
import { RegisterParticipanteParams } from "../interfaces/registerParticipanteParams";
import { prisma } from "../lib/prisma";
import {
  createPaymentMultipleUsersResgistration,
  createPaymentUserResgistration,
  PaymentInfo,
} from "../services/payments/createPaymentUserRegistration";
import LoteRepository from "./LoteRepository";
import UserAtividadeRepository from "./UserAtividadeRepository";
import UserInscricaoRepository from "./UserInscricaoRepository";

export default class EventRepository {
  static async registerParticipante(
    tx: Prisma.TransactionClient,
    {
      user_id,
      lote_id,
      atividades,
      paymentInfo,
    }: {
      user_id: string;
      lote_id: string;
      atividades?: RegisterParticipanteParams["atividades"];
      paymentInfo?: PaymentInfo;
    }
  ) {
    const lote = await LoteRepository.findLoteById(lote_id);

    if (lote.preco > 0) {
      const { payment_id, expiration_date } =
        await createPaymentUserResgistration(tx, user_id, lote_id, paymentInfo);

      await UserInscricaoRepository.createUserInscricao(
        tx,
        user_id,
        lote_id,
        user_id,
        payment_id,
        expiration_date
      );
    } else {
      await UserInscricaoRepository.createUserInscricao(
        tx,
        user_id,
        lote_id,
        user_id,
        "",
        "",
        "GRATUITO"
      );
    }

    if (atividades) {
      await UserAtividadeRepository.registerUserInActivities(
        tx,
        user_id,
        atividades
      );
    }
  }

  static async registerGuest(
    tx: Prisma.TransactionClient,
    {
      guest_id,
      payer_id,
      lote_id,
      atividades,
    }: {
      guest_id: string;
      payer_id: string;
      lote_id: string;
      atividades?: RegisterParticipanteParams["atividades"];
    }
  ) {
    const lote = await LoteRepository.findLoteById(lote_id);

    if (lote.preco > 0) {
      const { payment_id, expiration_date } =
        await createPaymentUserResgistration(tx, guest_id, lote_id);

      await UserInscricaoRepository.createUserInscricao(
        tx,
        guest_id,
        lote_id,
        payer_id,
        payment_id,
        expiration_date
      );
    } else {
      await UserInscricaoRepository.createUserInscricao(
        tx,
        guest_id,
        lote_id,
        payer_id,
        "",
        "",
        "GRATUITO"
      );
    }

    if (atividades) {
      await UserAtividadeRepository.registerUserInActivities(
        tx,
        guest_id,
        atividades
      );
    }
  }

  static async registerMultipleUsers(
    tx: Prisma.TransactionClient,
    {
      usersIds,
      payerId,
      loteId,
      atividades,
    }: {
      usersIds: string[];
      payerId: string;
      loteId: string;
      atividades?: RegisterParticipanteParams["atividades"];
    }
  ) {
    const lote = await LoteRepository.findLoteById(loteId);

    if (lote.preco > 0) {
      const { payment_id, expiration_date } =
        await createPaymentMultipleUsersResgistration(tx, usersIds, loteId);

      await UserInscricaoRepository.createManyUsersSubscriptions(
        tx,
        usersIds,
        loteId,
        payerId,
        payment_id,
        expiration_date
      );
    } else {
      await UserInscricaoRepository.createManyUsersSubscriptions(
        tx,
        usersIds,
        loteId,
        payerId,
        "",
        "",
        "GRATUITO"
      );
    }

    if (atividades) {
      await Promise.all(
        usersIds.map(async (guestId) => {
          await UserAtividadeRepository.registerUserInActivities(
            tx,
            guestId,
            atividades
          );
        })
      );
    }
  }

  static async findAllActivitiesInEvent(uuid_evento: string) {
    const activities = await prisma.evento.findFirst({
      where: {
        uuid_evento,
      },
      select: {
        atividade: {
          select: {
            uuid_atividade: true,
            nome: true,
            max_participants: true,
            tipo_atividade: true,
            _count: {
              select: {
                userAtividade: true,
              },
            },
          },
          orderBy: {
            nome: "asc",
          },
        },
      },
    });

    return activities;
  }

  static async findAllUserActivities(uuid_evento: string, uuid_user: string) {
    const activities = await prisma.userAtividade.findMany({
      where: {
        uuid_user,
        AND: {
          atividade: {
            uuid_evento,
          },
        },
      },
      select: {
        atividade: {
          select: {
            uuid_atividade: true,
            nome: true,
            max_participants: true,
            tipo_atividade: true,
            _count: {
              select: {
                userAtividade: true,
              },
            },
          },
        },
      },
    });

    return activities.map((activity) => ({
      ...activity.atividade,
      _count: activity.atividade._count.userAtividade,
    }));
  }

  static async getEventoPrecoById(uuid_evento: string) {
    const evento = await prisma.evento.findUniqueOrThrow({
      where: {
        uuid_evento,
      },
      select: {
        lote: {
          select: {
            preco: true,
          },
        },
      },
    });

    return evento.lote;
  }

  static async findAllEvents() {
    const response = await prisma.evento.findMany();

    return response.map((item) => ({
      ...item,
      slug: slugify(item.nome, { lower: true, strict: true }),
    }));
  }

  static async countUsuariosCredenciadosByEvento(idEvento: string) {
    const totalUsuariosCredenciados = await prisma.userInscricao.count({
      where: {
        credenciamento: true,
        lote: {
          evento: {
            uuid_evento: idEvento,
          },
        },
      },
    });

    return totalUsuariosCredenciados;
  }

  static async findPagamentoByUserID(user_id: string) {
    try {
      const pagamentos = await prisma.pagamento.findMany({
        where: {
          uuid_user: user_id,
        },
      });
      return pagamentos;
    } catch (error) {
      throw error;
    }
  }

  static async findEventById(event_id: string) {
    const event = await prisma.evento.findFirst({
      where: {
        uuid_evento: event_id,
      },
      select: {
        conteudo: true,
        date: true,
        nome: true,
        lote: {
          select: {
            ativo: true,
            descricao: true,
            uuid_lote: true,
            nome: true,
            preco: true,
          },
        },
        uuid_evento: true,
      },
    });

    if (!event) {
      throw new Error("Evento não encontrado!");
    }

    return event;
  }

  static async createEvent({
    uuid_user_owner,
    nome,
    banner_img_url,
    data,
    conteudo,
  }: {
    uuid_user_owner: string;
    nome: string;
    banner_img_url?: string;
    data?: Date;
    conteudo: string;
  }) {
    const event = await prisma.evento.create({
      data: {
        uuid_user_owner,
        conteudo,
        nome,
        banner_img_url,
        date: data,
        UserEvento: {
          create: {
            perfil: "ORGANIZADOR",
            uuid_user: uuid_user_owner,
          },
        },
      },
    });

    return event;
  }
}
