import { Prisma, TipoAtividade } from "@prisma/client";
import { RegisterParticipanteParams } from "../interfaces/registerParticipanteParams";
import ActivityRepository from "../modules/activities/activity.repository";
import { SubscribersInActivityDto } from "../modules/activities/schemas/subscribersInActivity.schema";
import { prisma } from "../plugins/prisma";

export default class UserAtividadeRepository {
  static async createUserAtividade(uuid_user: string, uuid_atividade: string) {
    await prisma.userAtividade.create({
      data: {
        uuid_user,
        uuid_atividade,
      },
    });
  }

  static async registerUserInActivities(
    tx: Prisma.TransactionClient,
    user_uuid: string,
    atividades: RegisterParticipanteParams["atividades"]
  ) {
    for (const item of atividades || []) {
      try {
        const activity = await ActivityRepository.findActivityById(
          item.atividade_id
        );

        if (!activity) {
          throw new Error("Atividade não encontrada");
        }

        if (
          activity.maxParticipants &&
          activity.numberOfRegistrations >= activity.maxParticipants
        ) {
          throw new Error(`A atividade ${activity.name} está cheia`);
        }

        await tx.userAtividade.create({
          data: {
            uuid_user: user_uuid,
            uuid_atividade: item.atividade_id,
          },
        });

        await tx.activity.update({
          where: {
            id: activity.id,
          },
          data: {
            numberOfRegistrations: activity.numberOfRegistrations + 1,
          },
        });
      } catch (error) {
        console.error(`Erro ao registrar na atividade ${item.atividade_id}`);
        throw error;
      }
    }
  }

  static async changeUserAtividade(
    uuid_atividade_atual: string,
    uuid_atividade_nova: string,
    uuid_user: string
  ) {
    await prisma.userAtividade.updateMany({
      where: {
        uuid_user,
        uuid_atividade: uuid_atividade_atual,
      },
      data: {
        uuid_atividade: uuid_atividade_nova,
      },
    });

    console.log("Atualizada com sucesso!");
  }

  static async findActivitiesByUserId(uuid_user: string) {
    const response = await prisma.userAtividade.findMany({
      where: {
        uuid_user,
      },
      select: {
        atividade: {
          select: {
            id: true,
            name: true,
            activityType: true,
          },
        },
        presenca: true,
      },
      orderBy: {
        atividade: {
          activityType: "asc",
        },
      },
    });

    return response.map((item) => ({
      ...item.atividade,
      presenca: item.presenca,
    }));
  }

  static async findUserAtividadeById(
    uuid_atividade: string,
    uuid_user: string
  ) {
    const activity = await prisma.userAtividade.findUnique({
      where: {
        uuid_user_uuid_atividade: {
          uuid_atividade,
          uuid_user,
        },
      },
    });

    return activity;
  }

  static async changeActivity(
    uuid_user: string,
    uuid_atividade_atual: string,
    uuid_atividade_nova: string
  ) {
    await prisma.userAtividade.update({
      where: {
        uuid_user_uuid_atividade: {
          uuid_atividade: uuid_atividade_atual,
          uuid_user,
        },
      },
      data: {
        uuid_atividade: uuid_atividade_nova,
      },
    });
  }

  static async findAllSubscribersInActivityExceptCurrentUser(
    uuid_atividade: string,
    exclude_user_id: string
  ) {
    const subscribers = await prisma.userAtividade.findMany({
      where: {
        uuid_atividade,
        uuid_user: {
          not: exclude_user_id,
        },
      },
      select: {
        uuid_user: true,
        presenca: true,
        user: {
          select: {
            nome: true,
            email: true,
            nome_cracha: true,
          },
        },
      },
      orderBy: {
        user: {
          nome: "asc",
        },
      },
    });

    return subscribers;
  }

  static async findAllSubscribersInActivity(
    uuid_atividade: string
  ): Promise<SubscribersInActivityDto> {
    const subscribers = await prisma.userAtividade.findMany({
      where: {
        uuid_atividade,
        user: {
          userInscricao: {
            some: {
              status_pagamento: {
                in: ["REALIZADO", "GRATUITO"],
              },
            },
          },
        },
      },
      select: {
        uuid_user: true,
        presenca: true,
        user: {
          select: {
            nome: true,
            email: true,
            nome_cracha: true,
          },
        },
      },
      orderBy: {
        user: {
          nome: "asc",
        },
      },
    });

    return subscribers.map((subscriber) => ({
      uuid_user: subscriber.uuid_user,
      presenca: subscriber.presenca,
      ...subscriber.user,
    }));
  }

  static async deleteAllActivityByUserAndType(
    userId: string,
    activityType: TipoAtividade
  ) {
    await prisma.userAtividade.deleteMany({
      where: {
        uuid_user: userId,
        atividade: {
          activityType: activityType,
        },
      },
    });
  }

  static async checkIfActivityHasVacancy(
    activityId: string,
    userId: string
  ): Promise<void> {
    const activity = await ActivityRepository.findActivityById(activityId);

    if (!activity) {
      throw new Error("Atividade inválida!");
    }

    if (activity.maxParticipants) {
      const totalParticipants = (
        await this.findAllSubscribersInActivityExceptCurrentUser(
          activityId,
          userId
        )
      ).length;

      if (totalParticipants >= activity.maxParticipants) {
        throw new Error(`A atividade ${activity.name} já está esgotada.`);
      }
    }
  }

  static async replaceActivity(
    userId: string,
    activityId: string,
    activityType: TipoAtividade
  ): Promise<void> {
    await this.checkIfActivityHasVacancy(activityId, userId);

    await this.deleteAllActivityByUserAndType(userId, activityType);

    await prisma.userAtividade.create({
      data: {
        uuid_user: userId,
        uuid_atividade: activityId,
      },
    });
  }

  static async changePresencaValueInActivity(
    uuid_atividade: string,
    uuid_user: string,
    presenca_value: boolean
  ) {
    await prisma.userAtividade.update({
      where: {
        uuid_user_uuid_atividade: {
          uuid_atividade,
          uuid_user,
        },
      },
      data: {
        presenca: presenca_value,
      },
    });
  }
}
