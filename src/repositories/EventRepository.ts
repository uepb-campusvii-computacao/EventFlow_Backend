import { Prisma } from "@prisma/client";
import slugify from "slugify";
import BatchRepository from "../modules/batchs/batch.repository";
import { RegisterUserInEventDto } from "../modules/events/schemas/registerUserInEvent.schema";
import UserActivityRepository from "../modules/userActivities/userActivities.repository";
import { prisma } from "../plugins/prisma";
import { createPaymentUserResgistration } from "../services/payments/createPaymentUserRegistration";
import UserInscricaoRepository from "./UserInscricaoRepository";

export default class EventRepository {
  static async registerParticipante(
    tx: Prisma.TransactionClient,
    { userId, batchId, activities }: RegisterUserInEventDto
  ) {
    const lote = await BatchRepository.findBatchById(batchId);

    if (lote.price > 0) {
      const { payment_id, expiration_date } =
        await createPaymentUserResgistration(tx, userId, batchId);

      await UserInscricaoRepository.createUserInscricao(
        tx,
        userId,
        batchId,
        payment_id,
        expiration_date
      );
    } else {
      await UserInscricaoRepository.createUserInscricao(
        tx,
        userId,
        batchId,
        "",
        "",
        "GRATUITO"
      );
    }

    if (activities) {
      await UserActivityRepository.registerUserInActivities(tx, userId, {
        activities,
      });
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
            id: true,
            name: true,
            maxParticipants: true,
            activityType: true,
            numberOfRegistrations: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    });

    return activities;
  }

  static async findAllUserActivities(eventId: string, userId: string) {
    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        AND: {
          activity: {
            eventId,
          },
        },
      },
      select: {
        activity: {
          select: {
            id: true,
            name: true,
            maxParticipants: true,
            activityType: true,
            numberOfRegistrations: true,
          },
        },
      },
    });

    return activities.map((activity) => ({
      ...activity.activity,
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
            price: true,
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
          event: {
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
            isActive: true,
            description: true,
            id: true,
            name: true,
            price: true,
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
