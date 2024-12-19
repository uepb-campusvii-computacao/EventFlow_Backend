import { Perfil } from "@prisma/client";
import { prisma } from "../plugins/prisma";
import EventRepository from "./EventRepository";

export default class UserEventRepository {
  static async registerUserInEvent({
    uuid_user,
    batchId,
    perfil,
    atividades,
  }: {
    uuid_user: string;
    perfil?: Perfil;
    atividades?: {
      atividade_id: string;
    }[];
    batchId: string;
  }) {
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
            uuid_user,
            uuid_evento: existingBatch?.id,
          },
        },
      });

      if (existingUserEvent) {
        throw new Error("Usuário já participa deste evento");
      }

      const userPerfil = perfil ?? Perfil.PARTICIPANTE;

      await tx.userEvento.create({
        data: {
          uuid_user,
          uuid_evento: existingBatch.eventId,
          perfil: userPerfil,
        },
      });

      await EventRepository.registerParticipante(tx, {
        user_id: uuid_user,
        lote_id: batchId,
        atividades,
      });
    });
  }
}
