import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export default class LoteRepository {
  public static async createBatch({
    nome,
    descricao,
    preco,
    max_inscricoes,
    ativo,
    uuid_evento,
  }: {
    nome: string;
    descricao: string;
    preco?: number;
    max_inscricoes: number;
    ativo?: boolean;
    uuid_evento: string;
  }) {
    const lote = await prisma.lote.create({
      data: {
        nome,
        descricao,
        preco: preco || 0,
        max_inscricoes,
        ativo,
        uuid_evento,
        inscricoes: 0,
      },
    });

    return lote;
  }

  static async findLoteById(uuid_lote: string) {
    const lote = await prisma.lote.findUnique({
      where: {
        uuid_lote,
      },
    });

    if (!lote) {
      throw new Error("Lote não encontrado");
    }

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

  static async getAllLotesByEventID(id_evento: string) {
    const lotes = await prisma.lote.findMany({
      where: {
        uuid_evento: id_evento,
      },
    });

    return lotes;
  }

  static async toggleLoteAtivo(lote_id: string): Promise<void> {
    const lote = await prisma.lote.findUnique({
      where: { uuid_lote: lote_id },
    });

    if (!lote) {
      throw new Error("Lote não encontrado");
    }

    await prisma.lote.update({
      where: { uuid_lote: lote_id },
      data: { ativo: !lote.ativo },
    });
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
