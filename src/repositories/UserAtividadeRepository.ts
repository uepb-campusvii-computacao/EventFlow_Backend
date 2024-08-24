import { Prisma, TipoAtividade } from "@prisma/client";
import { RegisterParticipanteParams } from "../interfaces/registerParticipanteParams";
import { prisma } from "../lib/prisma";
import ActivityRepository from "./ActivityRepository";

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
    const activities_ids = [
      atividades?.minicurso_id,
      atividades?.workshop_id,
      atividades?.oficina_id,
    ];

    for (const uuid_atividade of activities_ids) {
      if (uuid_atividade) {
        const activity = await tx.atividade.findUnique({
          where: {
            uuid_atividade,
          },
        });

        if (!activity) {
          throw new Error("Atividade não encontrada");
        }

        const count = await tx.userAtividade.count({
          where: {
            uuid_atividade,
          },
        });

        if (activity.max_participants && count >= activity.max_participants) {
          throw new Error(`A atividade ${activity.nome} está cheia`);
        }

        await tx.userAtividade.create({
          data: {
            uuid_user: user_uuid,
            uuid_atividade,
          },
        });
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
            uuid_atividade: true,
            nome: true,
            tipo_atividade: true,
          },
        },
        presenca: true,
      },
      orderBy: {
        atividade: {
          tipo_atividade: "asc",
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

  static async findAllSubscribersInActivity(uuid_atividade: string) {
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

    return subscribers;
  }

  static async deleteAllActivityByUserAndType(
    userId: string,
    activityType: TipoAtividade
  ) {
    await prisma.userAtividade.deleteMany({
      where: {
        uuid_user: userId,
        atividade: {
          tipo_atividade: activityType,
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

    if (activity.max_participants) {
      const totalParticipants = (
        await this.findAllSubscribersInActivityExceptCurrentUser(
          activityId,
          userId
        )
      ).length;

      if (totalParticipants >= activity.max_participants) {
        throw new Error(`A atividade ${activity.nome} já está esgotada.`);
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
