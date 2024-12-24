import { Prisma } from "@prisma/client";
import ActivityRepository from "../../modules/activities/activity.repository";
import { SubscribersInActivityDto } from "../../modules/activities/schemas/subscribersInActivity.schema";
import { prisma } from "../../plugins/prisma";
import { ActivitiesOfUserDto } from "./schemas/activitiesOfUser.schema";
import { RegisterUserLoggedInActivitiesDto } from "./schemas/register.schema";
import { UserActivityDetailsDto } from "./schemas/userActivityDetails.schema";

export default class UserActivityRepository {
  static async createUserActivity(
    userId: string,
    activityId: string
  ): Promise<void> {
    await prisma.userActivity.create({
      data: {
        userId,
        activityId,
      },
    });
  }

  static async registerUserInActivities(
    tx: Prisma.TransactionClient,
    userId: string,
    { activities }: RegisterUserLoggedInActivitiesDto
  ): Promise<void> {
    for (const item of activities || []) {
      try {
        const activity = await ActivityRepository.findActivityById(
          item.activityId
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

        await tx.userActivity.create({
          data: {
            userId,
            activityId: activity.id,
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
        console.error(`Erro ao registrar na atividade ${item.activityId}`);
        throw error;
      }
    }
  }

  static async changeUserActivities(
    currentActivityId: string,
    newActivityId: string,
    userId: string
  ): Promise<void> {
    await prisma.userActivity.updateMany({
      where: {
        userId,
        activityId: currentActivityId,
      },
      data: {
        activityId: newActivityId,
      },
    });
  }

  static async findActivitiesByUserId(
    userId: string
  ): Promise<ActivitiesOfUserDto> {
    const response = await prisma.userActivity.findMany({
      where: {
        userId,
      },
      select: {
        activity: {
          select: {
            name: true,
            activityType: true,
          },
        },
        activityId: true,
        isPresent: true,
      },
      orderBy: {
        activity: {
          activityType: "asc",
        },
      },
    });

    return response.map((item) => ({
      ...item,
      ...item.activity,
    }));
  }

  static async findUserActivityDetails(
    activityId: string,
    userId: string
  ): Promise<UserActivityDetailsDto> {
    const userActivityDetails = await prisma.userActivity.findUniqueOrThrow({
      where: {
        userId_activityId: {
          activityId,
          userId,
        },
      },
      select: {
        activity: {
          select: {
            name: true,
            activityType: true,
            date: true,
          },
        },
        isPresent: true,
        activityId: true,
      },
    });

    return {
      ...userActivityDetails,
      ...userActivityDetails.activity,
    };
  }

  // static async changeActivity(
  //   uuid_user: string,
  //   uuid_atividade_atual: string,
  //   uuid_atividade_nova: string
  // ) {
  //   await prisma.userAtividade.update({
  //     where: {
  //       uuid_user_uuid_atividade: {
  //         uuid_atividade: uuid_atividade_atual,
  //         uuid_user,
  //       },
  //     },
  //     data: {
  //       uuid_atividade: uuid_atividade_nova,
  //     },
  //   });
  // }

  // static async findAllSubscribersInActivityExceptCurrentUser(
  //   uuid_atividade: string,
  //   exclude_user_id: string
  // ) {
  //   const subscribers = await prisma.userAtividade.findMany({
  //     where: {
  //       uuid_atividade,
  //       uuid_user: {
  //         not: exclude_user_id,
  //       },
  //     },
  //     select: {
  //       uuid_user: true,
  //       presenca: true,
  //       user: {
  //         select: {
  //           nome: true,
  //           email: true,
  //           nome_cracha: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       user: {
  //         nome: "asc",
  //       },
  //     },
  //   });

  //   return subscribers;
  // }

  static async findAllSubscribersInActivity(
    activityId: string
  ): Promise<SubscribersInActivityDto> {
    const subscribers = await prisma.userActivity.findMany({
      where: {
        activityId,
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
        userId: true,
        isPresent: true,
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
      userId: subscriber.userId,
      isPresent: subscriber.isPresent,
      ...subscriber.user,
    }));
  }

  static async toggleIsPresentValueInActivity(
    activityId: string,
    userId: string,
    isPresent: boolean
  ) {
    await prisma.userActivity.update({
      where: {
        userId_activityId: {
          activityId,
          userId,
        },
      },
      data: {
        isPresent,
      },
    });
  }

  /* static async deleteAllActivityByUserAndType(
    userId: string,
    activityType: TipoAtividade
  ) {
    await prisma.userActivity.deleteMany({
      where: {
        userId,
        activity: {
          activityType: activityType,
        },
      },
    });
  }

  static async checkIfActivityHasVacancy(activityId: string): Promise<void> {
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
      

      if (activity.numberOfRegistrations >= activity.maxParticipants) {
        throw new Error(`A atividade ${activity.name} já está esgotada.`);
      }
    }
  }

  static async replaceActivity(
    userId: string,
    activityId: string,
    activityType: TipoAtividade
  ): Promise<void> {
    await this.checkIfActivityHasVacancy(activityId);

    await this.deleteAllActivityByUserAndType(userId, activityType);

    await prisma.userActivity.create({
      data: {
        userId,
        activityId,
      },
    });
  }
*/
}
