import { RegisterParticipanteParams } from "../interfaces/registerParticipanteParams";
import { prisma } from "../lib/prisma";
import { createPaymentUserResgistration } from "../services/payments/createPaymentUserRegistration";
import LoteRepository from "./LoteRepository";
import UserAtividadeRepository from "./UserAtividadeRepository";
import UserInscricaoRepository from "./UserInscricaoRepository";
import UserRepository from "./UserRepository";

export default class EventRepository {
  static async registerParticipante({
    nome,
    nome_cracha,
    email,
    instituicao,
    atividades,
    lote_id,
  }: RegisterParticipanteParams) {
    return await prisma.$transaction(async (tx) => {
      const user = await UserRepository.createUser(tx, {
        nome,
        nome_cracha,
        email,
        instituicao,
      });

      if (await LoteRepository.isUserRegisteredInLote(tx, user.uuid_user, lote_id)) {
        throw new Error("Você já se cadastrou nesse evento!");
      }

      await UserAtividadeRepository.registerUserInActivities(
        tx,
        user.uuid_user,
        atividades
      );

      const { payment_id, expiration_date } =
        await createPaymentUserResgistration(tx, user.uuid_user, lote_id);

      return await UserInscricaoRepository.createUserInscricao(
        tx,
        user.uuid_user,
        lote_id,
        payment_id,
        expiration_date
      );
    });
  }

  static async findAllActivitiesInEvent(uuid_evento: string) {
    const activities = await prisma.evento.findFirst({
      where: {
        uuid_evento,
      },
      select: {
        atividade: {
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
          orderBy: {
            nome: "asc",
          },
        },
      },
    });

    return activities;
  }

  static async getEventoPrecoById(uuid_evento: string) {
    const evento = await prisma.evento.findUniqueOrThrow({
      where: {
        uuid_evento,
      },
      select: {
        lote: {
          select: {
            preco: true,
          },
        },
      },
    });

    return evento.lote;
  }

  static async findAllEvents() {
    const response = await prisma.evento.findMany();

    return response;
  }

  static async countUsuariosCredenciadosByEvento(idEvento: string) {
    const totalUsuariosCredenciados = await prisma.userInscricao.count({
      where: {
        credenciamento: true,
        lote: {
          evento: {
            uuid_evento: idEvento,
          },
        },
      },
    });

    return totalUsuariosCredenciados;
  }

  static async findPagamentoByUserID(user_id: string) {
    try {
      const pagamentos = await prisma.pagamento.findMany({
        where: {
          uuid_user: user_id,
        },
      });
      return pagamentos;
    } catch (error) {
      throw error;
    }
  }
}
