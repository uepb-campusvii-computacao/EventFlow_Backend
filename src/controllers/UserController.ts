import { StatusPagamento } from "@prisma/client";
import { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { FindLoteIdAnduserIdParams } from "../interfaces/findLoteIdAnduserIdParams";
import { UpdatePaymentStatusParams } from "../interfaces/updatePaymentStatusParams";
import { UserLoginParams } from "../interfaces/userLoginParams";

import LoteRepository from "../repositories/LoteRepository";
import UserAtividadeRepository from "../repositories/UserAtividadeRepository";
import UserInscricaoRepository from "../repositories/UserInscricaoRepository";
import UserRepository from "../repositories/UserRepository";
import {
  getPayment,
  getPaymentStatusForInscricao,
} from "../services/payments/getPayment";
import { checkPassword } from "../services/user/checkPassword";
import { deleteUserByUserId } from "../services/user/deleteUserByUserId";
import { encryptPassword } from "../services/user/encryptPassword";

export default class UserController {
  static async loginUser(req: Request, res: Response) {
    const params: UserLoginParams = req.body;

    const { email, senha } = params;

    const userExists = await UserRepository.findUserByEmail(email);

    if (!userExists) {
      return res.status(401).send("email não encontrado");
    }

    const password_encrypted = userExists.senha || "";

    const check_password = await checkPassword(senha, password_encrypted);

    if (!check_password) {
      return res.status(401).send("Senha inválida!");
    }

    const token = jsonwebtoken.sign(
      {
        id: userExists.uuid_user,
      },
      String(process.env.SECRET),
      {
        expiresIn: "12h",
      }
    );

    return res
      .status(200)
      .json({ token: token, user_id: userExists.uuid_user });
  }

  static async gerarSenha(req: Request, res: Response){
    const params = req.body;

    const senha = await encryptPassword(params.senha);

    return res.json({senha: senha});
  }

  static async getLoteIdAndUserId(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      const { email }: FindLoteIdAnduserIdParams = req.body;

      const response = await UserInscricaoRepository.findLoteIdAndUserIdByEmail(
        event_id,
        email
      );

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(error.message);
      }
      return res.status(400).send(error);
    }
  }

  static async realizarPagamento(req: Request, res: Response) {
    try {
      const { lote_id, user_id } = req.params;
      const { action } = req.body;

      if (action === "payment.updated") {
        const [status, user_inscricao] = await Promise.all([
          getPaymentStatusForInscricao(user_id, lote_id),
          UserInscricaoRepository.findUserInscricaoById(user_id, lote_id),
        ]);

        if (
          status &&
          user_inscricao?.status_pagamento !== StatusPagamento.GRATUITO
        ) {
          await UserInscricaoRepository.changeStatusPagamento(
            user_id,
            lote_id,
            status
          );
        }
      }

      return res.status(200).send("Valor alterado");
    } catch (error) {
      return res.status(400).send("Informações inválidas");
    }
  }

  static async getUserInformation(req: Request, res: Response) {
    try {
      const { user_id, lote_id } = req.params;

      const atividades = await UserAtividadeRepository.findActivitiesByUserId(
        user_id
      );
      const user = await UserRepository.findUserById(user_id);
      const user_inscricao =
        await UserInscricaoRepository.findUserInscricaoById(user_id, lote_id);
      const lote = await LoteRepository.findLoteById(lote_id);

      const response = {
        user_name: user.nome,
        email: user.email,
        inscricao: {
          status: user_inscricao?.status_pagamento,
          nome_lote: lote.nome,
          preco: lote.preco,
        },
        atividades: atividades.map((atividade) => ({
          nome: atividade.nome,
          tipo: atividade.tipo_atividade,
        })),
      };

      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async getUserInscricao(req: Request, res: Response) {
    try {
      const { user_id, lote_id } = req.params;

      const user_inscricao =
        await UserInscricaoRepository.findUserInscricaoById(user_id, lote_id);

        console.log(user_inscricao)
      const payment = await getPayment(user_inscricao!.id_payment_mercado_pago);

      return res.status(200).json(payment);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async getUserInEvent(req: Request, res: Response) {
    try {
      const { event_id, user_id } = req.params;

      const personal_user_information = await UserRepository.findUserById(
        user_id
      );

      const activities = await UserAtividadeRepository.findActivitiesByUserId(
        user_id
      );

      const user_inscricao =
        await UserInscricaoRepository.findUserInscricaoByEventId(
          user_id,
          event_id
        );

      const response = {
        personal_user_information: {
          uuid: personal_user_information.uuid_user,
          nome: personal_user_information.nome,
          nome_cracha: personal_user_information.nome_cracha,
          email: personal_user_information.email,
          instituicao: personal_user_information.instituicao,
        },
        atividades: activities,
        status_pagamento: user_inscricao?.status_pagamento,
        credenciamento: user_inscricao?.credenciamento,
      };

      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).send("Informações inválidas");
    }
  }

  static async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { lote_id, user_id } = req.params;
      const { status_pagamento }: UpdatePaymentStatusParams = req.body;

      await UserInscricaoRepository.changeStatusPagamento(
        lote_id,
        user_id,
        status_pagamento
      );

      res.status(200).send("Alterado com sucesso!");
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;

      await deleteUserByUserId(user_id);

      return res.status(200).send("Usuario deletado");
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}
