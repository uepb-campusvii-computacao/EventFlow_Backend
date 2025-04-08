import { TipoAtividade } from "@prisma/client";
import { prisma } from "../lib/prisma";

export default class ActivityRepository {
  static async findActivityById(uuid_atividade: string) {
    const activity = await prisma.atividade.findUniqueOrThrow({
      where: {
        uuid_atividade,
      },
    });

    return activity;
  }

  static async findActivityPubInfoById(uuid_atividade: string) {
    const activity = await prisma.atividade.findUnique({
      where: {
        uuid_atividade: uuid_atividade,
      },
      select: {
        nome: true,
        descricao: true,
        tipo_atividade: true,
        max_participants: true,
      },
    });

    return activity;
  }

  static async updateActivityById(
    uuid_atividade: string,
    nome: string,
    descricao: string,
    tipo_atividade: TipoAtividade,
    max_participants: number
  ) {
    const activity = await prisma.atividade.update({
      where: {
        uuid_atividade,
      },
      data: {
        nome,
        descricao,
        tipo_atividade,
        max_participants,
      },
    });

    return activity;
  }

  static async findActivitiesInEvent(
    uuid_evento: string,
    tipo_atividade: TipoAtividade
  ) {
    const activities = await prisma.atividade.findMany({
      where: {
        uuid_evento,
        AND: {
          tipo_atividade,
        },
      },
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
    });

    return activities.map((activity) => ({
      ...activity,
      _count: activity._count.userAtividade,
    }));
  }

  static async createActivity({
    uuid_evento,
    nome,
    max_participants,
    data,
    descricao,
    tipo_atividade
  }: {
    uuid_evento: string;
    nome: string;
    max_participants?:number;
    data?: Date;
    descricao: string;
    tipo_atividade: TipoAtividade;
  }){
    const activity = await prisma.atividade.create({
      data: {
        uuid_evento,
        nome,
        date: data,
        descricao,
        max_participants,
        tipo_atividade
      }
    });

    return activity;
  }

  static async findActivitiesGroupedByTurno() {
    const activities = await prisma.atividade.findMany({
      select: {
        uuid_atividade: true,
        nome: true,
        turno: true,
        tipo_atividade: true,
        max_participants: true,
      },
    });

    const groupedActivities = activities.reduce((acc, activity) => {
      const turno = activity.turno || "SEM_TURNO";
      if (!acc[turno]) {
        acc[turno] = [];
      }
      acc[turno].push(activity);
      return acc;
    }, {} as Record<string, typeof activities>);

    return groupedActivities;
  }
}
