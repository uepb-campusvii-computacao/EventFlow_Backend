import { Prisma } from "@prisma/client";
import slugify from "slugify";
import { RegisterParticipanteParams } from "../interfaces/registerParticipanteParams";
import { prisma } from "../lib/prisma";
import { createPaymentUserResgistration } from "../services/payments/createPaymentUserRegistration";
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
    }: {
      user_id: string;
      lote_id: string;
      atividades: RegisterParticipanteParams["atividades"];
    }
  ) {
    const lote = await LoteRepository.findLoteById(lote_id);

    if (lote.preco > 0) {
      const { payment_id, expiration_date } =
        await createPaymentUserResgistration(tx, user_id, lote_id);

      await UserInscricaoRepository.createUserInscricao(
        tx,
        user_id,
        lote_id,
        payment_id,
        expiration_date
      );
    } else {
      await UserInscricaoRepository.createUserInscricao(
        tx,
        user_id,
        lote_id,
        "",
        "",
        "GRATUITO"
      );
    }

    await UserAtividadeRepository.registerUserInActivities(
      tx,
      user_id,
      atividades
    );
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
}
