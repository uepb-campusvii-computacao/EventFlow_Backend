import { TipoAtividade } from "@prisma/client";
import { prisma } from "../../plugins/prisma";
import { ActivityDto } from "./schemas/activity.schema";
import { ActivityPubInfoDto } from "./schemas/activityPubInfo.schema";
import { CreateActivityDto } from "./schemas/createActivity.schema";
import { UpdateActivityDto } from "./schemas/updateActivity.schema";

export default class ActivityRepository {
  static async findActivityById(id: string): Promise<ActivityDto> {
    const activity = await prisma.activity.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return activity;
  }

  static async findActivityPubInfoById(
    id: string
  ): Promise<ActivityPubInfoDto | null> {
    const activity = await prisma.activity.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        description: true,
        date: true,
        activityType: true,
        maxParticipants: true,
        numberOfRegistrations: true,
      },
    });

    return activity;
  }

  static async updateActivityById(
    id: string,
    {
      name,
      activityType,
      description,
      date,
      maxParticipants,
      numberOfRegistrations,
    }: UpdateActivityDto
  ): Promise<ActivityDto> {
    const activity = await prisma.activity.update({
      where: {
        id,
      },
      data: {
        name,
        activityType,
        description,
        date,
        maxParticipants,
        numberOfRegistrations,
      },
    });

    return activity;
  }

  static async findActivitiesInEventByType(
    eventId: string,
    activityType: TipoAtividade
  ) {
    const activities = await prisma.activity.findMany({
      where: {
        eventId,
        AND: {
          activityType,
        },
      },
      select: {
        id: true,
        name: true,
        maxParticipants: true,
        activityType: true,
        numberOfRegistrations: true,
      },
    });

    return activities;
  }

  static async createActivity({
    eventId,
    name,
    description,
    activityType,
    date,
    maxParticipants,
  }: CreateActivityDto): Promise<ActivityDto> {
    const activity = await prisma.activity.create({
      data: {
        eventId,
        name,
        description,
        activityType,
        date,
        maxParticipants,
      },
    });

    return activity;
  }
}
