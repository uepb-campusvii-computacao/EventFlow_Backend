import { Prisma } from "@prisma/client";
import { prisma } from "../../plugins/prisma";

export default class BatchRepository {
  static async findBatchById(id: string) {
    const batch = await prisma.batch.findUnique({
      where: {
        id,
      },
    });

    if (!batch) {
      throw new Error("Lote não encontrado");
    }

    return batch;
  }

  static async getBatchActiveByEventID(id_evento: string) {
    const lotes = await prisma.batch.findMany({
      where: {
        eventId: id_evento,
        isActive: true,
      },
    });

    return lotes;
  }

  static async getAllBatchsByEventID(id_evento: string) {
    const batch = await prisma.batch.findMany({
      where: {
        eventId: id_evento,
      },
    });

    return batch;
  }

  static async toggleBatchActiveStatus(id: string) {
    const batch = await prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new Error("Lote não encontrado");
    }

    await prisma.batch.update({
      where: { id },
      data: { isActive: !batch.isActive },
    });
  }

  static async isUserRegisteredInBatch(
    tx: Prisma.TransactionClient,
    user_uuid: string,
    batchId: string
  ): Promise<boolean> {
    const record = await tx.userInscricao.findFirst({
      where: {
        uuid_user: user_uuid,
        uuid_lote: batchId,
      },
    });

    return Boolean(record);
  }
}
