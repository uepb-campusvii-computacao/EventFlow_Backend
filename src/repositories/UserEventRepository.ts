import { Perfil } from "@prisma/client";
import { RegisterUserInEventParams } from "../interfaces/registerUserInEventParams";
import { prisma } from "../lib/prisma";

export default class UserEventRepository {
  static async registerUserInEvent({
    user_id,
    event_id,
    perfil,
  }: RegisterUserInEventParams) {
    return prisma.$transaction(async (tx) => {
      const existingUserEvent = await tx.userEvento.findUnique({
        where: {
          uuid_user_uuid_evento: {
            uuid_user: user_id,
            uuid_evento: event_id,
          },
        },
      });

      if (existingUserEvent) {
        throw new Error("Usuário já participa deste evento");
      }

      return await tx.userEvento.create({
        data: {
          uuid_user: user_id,
          uuid_evento: event_id,
          perfil: perfil || Perfil.PARTICIPANTE,
        },
      });
    });
  }
}
