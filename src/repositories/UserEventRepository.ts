import { Perfil } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PaymentInfo } from "../services/payments/createPaymentUserRegistration";
import EventRepository from "./EventRepository";
import UserInscricaoRepository from "./UserInscricaoRepository";

export default class UserEventRepository {
  static async createNewPayment({
    uuid_user,
    lote_id,
    perfil,
    atividades,
    paymentInfo,
  }: {
    uuid_user: string;
    perfil: Perfil;
    atividades?: {
      atividade_id: string;
    }[];
    lote_id: string;
    paymentInfo?: PaymentInfo;
  }) {
    return prisma.$transaction(async (tx) => {
      const existingLote = await tx.lote.findFirst({
        where: {
          uuid_lote: lote_id,
        },
      });

      if (!existingLote) {
        throw new Error("Lote não encontrado!");
      }

      const existingUserEvent = await tx.userEvento.findUnique({
        where: {
          uuid_user_uuid_evento: {
            uuid_user,
            uuid_evento: existingLote?.uuid_evento,
          },
        },
      });

      if (!existingUserEvent) {
        throw new Error("Usuário não participa deste evento");
      }

      await UserInscricaoRepository.deleteUserInscricaoWithTransaction(
        tx,
        existingLote.uuid_lote,
        existingUserEvent.uuid_user
      );

      await EventRepository.registerParticipante(tx, {
        user_id: uuid_user,
        lote_id,
        atividades,
        paymentInfo,
      });
    });
  }

  static async registerUserInEvent({
    uuid_user,
    lote_id,
    perfil,
    atividades,
    paymentInfo,
  }: {
    uuid_user: string;
    perfil: Perfil;
    atividades?: {
      atividade_id: string;
    }[];
    lote_id: string;
    paymentInfo?: PaymentInfo;
  }) {
    return prisma.$transaction(async (tx) => {
      const existingLote = await tx.lote.findFirst({
        where: {
          uuid_lote: lote_id,
        },
      });

      if (!existingLote) {
        throw new Error("Lote não encontrado!");
      }

      if (!existingLote.ativo) {
        throw new Error("Lote não está ativo!");
      }

      if (existingLote.inscricoes == existingLote.max_inscricoes - 1) {
        await tx.lote.update({
          where: {
            uuid_lote: lote_id,
          },
          data: {
            ativo: false,
          },
        });
      }

      const existingUserEvent = await tx.userEvento.findUnique({
        where: {
          uuid_user_uuid_evento: {
            uuid_user,
            uuid_evento: existingLote?.uuid_evento,
          },
        },
      });

      if (existingUserEvent) {
        throw new Error("Usuário já participa deste evento");
      }

      await tx.lote.update({
        where: {
          uuid_lote: lote_id,
        },
        data: {
          inscricoes: {
            increment: 1,
          },
        },
      });

      await tx.userEvento.create({
        data: {
          uuid_user,
          uuid_evento: existingLote.uuid_evento,
          perfil: perfil || Perfil.PARTICIPANTE,
        },
      });

      await EventRepository.registerParticipante(tx, {
        user_id: uuid_user,
        lote_id,
        atividades,
        paymentInfo,
      });
    });
  }

  static async registerGuestInEvent({
    uuid_guest,
    payer_id,
    lote_id,
    perfil,
    atividades,
    paymentInfo,
  }: {
    uuid_guest: string;
    payer_id: string;
    perfil: Perfil;
    atividades?: {
      atividade_id: string;
    }[];
    lote_id: string;
    paymentInfo?: PaymentInfo;
  }) {
    return prisma.$transaction(async (tx) => {
      const existingLote = await tx.lote.findFirst({
        where: {
          uuid_lote: lote_id,
        },
      });

      if (!existingLote) {
        throw new Error("Lote não encontrado!");
      }

      const existingUserEvent = await tx.userEvento.findUnique({
        where: {
          uuid_user_uuid_evento: {
            uuid_user: uuid_guest,
            uuid_evento: existingLote?.uuid_evento,
          },
        },
      });

      if (existingUserEvent) {
        throw new Error("Usuário já participa deste evento");
      }

      await tx.userEvento.create({
        data: {
          uuid_user: uuid_guest,
          uuid_evento: existingLote.uuid_evento,
          perfil: perfil || Perfil.PARTICIPANTE,
        },
      });

      await EventRepository.registerGuest(tx, {
        guest_id: uuid_guest,
        payer_id,
        lote_id,
        atividades,
        paymentInfo,
      });
    });
  }

  public static async registerMultipleUsersInEvent({
    atividades,
    usersIds,
    loteId,
    perfil,
    paymentInfo,
  }: {
    atividades?: { atividade_id: string }[];
    usersIds: string[];
    loteId: string;
    perfil?: Perfil;
    paymentInfo?: PaymentInfo;
  }) {
    return prisma.$transaction(async (tx) => {
      const existingLote = await tx.lote.findFirst({
        where: {
          uuid_lote: loteId,
        },
      });

      if (!existingLote) {
        throw new Error("Lote não encontrado!");
      }

      const existingUsers = await tx.userEvento.findMany({
        where: {
          uuid_user: {
            in: usersIds,
          },
          uuid_evento: existingLote?.uuid_evento,
        },
      });

      if (existingUsers.length >= 1) {
        throw new Error("Algum dos usuários já participa deste evento");
      }

      await tx.lote.update({
        where: {
          uuid_lote: loteId,
        },
        data: {
          inscricoes: {
            increment: usersIds.length,
          },
        },
      });

      await tx.userEvento.createMany({
        data: usersIds.map((userId) => ({
          uuid_user: userId,
          uuid_evento: existingLote.uuid_evento,
          perfil: perfil || Perfil.PARTICIPANTE,
        })),
      });

      const payerId = usersIds[usersIds.length - 1];

      await EventRepository.registerMultipleUsers(tx, {
        usersIds,
        loteId,
        payerId,
        atividades,
        paymentInfo,
      });
    });
  }
}
