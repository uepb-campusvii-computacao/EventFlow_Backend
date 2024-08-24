import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export default class LoteRepository {
  static async findLoteById(uuid_lote: string) {
    const lote = await prisma.lote.findUniqueOrThrow({
      where: {
        uuid_lote,
      },
    });

    return lote;
  }

  static async getLotesAtivosByEventID(id_evento: string) {
    const lotes = await prisma.lote.findMany({
      where: {
        uuid_evento: id_evento,
        ativo: true,
      },
    });

    return lotes;
  }

  static async isUserRegisteredInLote(
    tx: Prisma.TransactionClient,
    user_uuid: string,
    lote_id: string
  ): Promise<boolean> {
    const registro = await tx.userInscricao.findFirst({
      where: {
        uuid_user: user_uuid,
        uuid_lote: lote_id,
      },
    });

    return Boolean(registro);
  }
}
