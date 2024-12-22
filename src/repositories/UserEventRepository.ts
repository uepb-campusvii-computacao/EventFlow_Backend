import { Perfil } from "@prisma/client";
import { RegisterUserInEventDto } from "../modules/events/schemas/registerUserInEvent.schema";
import { prisma } from "../plugins/prisma";
import EventRepository from "./EventRepository";

export default class UserEventRepository {
  static async registerUserInEvent({
    userId,
    batchId,
    perfil,
    activities,
  }: RegisterUserInEventDto) {
    return prisma.$transaction(async (tx) => {
      const existingBatch = await tx.batch.findFirst({
        where: {
          id: batchId,
        },
      });

      if (!existingBatch) {
        throw new Error("Lote não encontrado!");
      }

      const existingUserEvent = await tx.userEvento.findUnique({
        where: {
          uuid_user_uuid_evento: {
            uuid_user: userId,
            uuid_evento: existingBatch?.eventId,
          },
        },
      });

      if (existingUserEvent) {
        throw new Error("Usuário já participa deste evento");
      }

      const userPerfil = perfil ?? Perfil.PARTICIPANTE;

      await tx.userEvento.create({
        data: {
          uuid_user: userId,
          uuid_evento: existingBatch.eventId,
          perfil: userPerfil,
        },
      });

      await EventRepository.registerParticipante(tx, {
        userId,
        batchId,
        activities,
      });
    });
  }
}
