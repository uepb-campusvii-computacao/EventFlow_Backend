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

  static async findActivitiesByShift(turno: TurnoAtividade, event_id: string) {
    const activities = await prisma.atividade.findMany({
      where: {
        uuid_evento: event_id,
        turno: turno || null,
      },
      select: {
        uuid_atividade: true,
        nome: true,
        turno: true,
        tipo_atividade: true,
        max_participants: true,
        _count: {
          select: {
            userAtividade: true,
          },
        },
      },
    });

    return activities;
  }

  static async findAllActivitiesByShift(event_id: string) {
    const activities = await prisma.atividade.findMany({
      where: {
        uuid_evento: event_id,
      },
      select: {
        uuid_atividade: true,
        nome: true,
        turno: true,
        tipo_atividade: true,
        max_participants: true,
        _count: {
          select: {
            userAtividade: true,
          },
        },
      },
    });

    const activitiesFormatted = activities.map((activity) => {
      return {
        ...activity,
        _count: activity._count.userAtividade,
      };
    });

    const groupedByTypeAndShift = activitiesFormatted.reduce(
      (
        acc: Record<
          string,
          Record<
            TurnoAtividade | "Sem turno",
            Array<(typeof activitiesFormatted)[number]>
          >
        >,
        activity
      ) => {
        const { tipo_atividade, turno } = activity;
        const shift = turno || "Sem turno";
        if (!acc[tipo_atividade]) {
          acc[tipo_atividade] = {} as Record<
            TurnoAtividade | "Sem turno",
            Array<(typeof activitiesFormatted)[number]>
          >;
        }
        if (!acc[tipo_atividade][shift]) {
          acc[tipo_atividade][shift] = [];
        }
        acc[tipo_atividade][shift].push(activity);
        return acc;
      },
      {} as Record<
        string,
        Record<
          TurnoAtividade | "Sem turno",
          Array<(typeof activitiesFormatted)[number]>
        >
      >
    );

    return groupedByTypeAndShift;
  }
}
