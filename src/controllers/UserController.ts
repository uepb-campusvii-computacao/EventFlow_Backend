import { StatusPagamento } from "@prisma/client";
import { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { FindLoteIdAnduserIdParams } from "../interfaces/findLoteIdAnduserIdParams";
import { UpdatePaymentStatusParams } from "../interfaces/updatePaymentStatusParams";
import { UserLoginParams } from "../interfaces/userLoginParams";

import { z, ZodError } from "zod";
import BatchRepository from "../modules/batchs/batch.repository";
import { updatePaymentStatusDto } from "../modules/batchs/schemas/updatePayment.schema";
import { prisma } from "../plugins/prisma";
import UserAtividadeRepository from "../repositories/UserAtividadeRepository";
import UserInscricaoRepository from "../repositories/UserInscricaoRepository";
import UserRepository from "../repositories/UserRepository";
import { sendPasswordResetEmail } from "../services/emailService";
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

  static async registerUser(req: Request, res: Response) {
    try {
      const registerUserSchema = z
        .object({
          name: z.string(),
          email: z.string().email("Invalid email format"),
          nickname: z.string(),
          organization: z.string(),
          password: z
            .string()
            .min(8, "Password must be at least 8 characters long"),
          confirm_password: z.string(),
        })
        .refine((data) => data.password === data.confirm_password, {
          message: "Passwords do not match",
          path: ["confirm_password"],
        });

      const { name, email, nickname, password, organization } =
        registerUserSchema.parse(req.body);

      const password_encrypted = await encryptPassword(password);

      const user = await UserRepository.createUser({
        nome: name,
        nome_cracha: nickname,
        senha: password_encrypted,
        email: email,
        instituicao: organization,
      });

      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json(formattedErrors);
      }

      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }

      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: error });
    }
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
      const { action } = updatePaymentStatusDto.parse(req.body);

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

      const atividades: any =
        await UserAtividadeRepository.findActivitiesByUserId(user_id);
      const user = await UserRepository.findUserById(user_id);
      const user_inscricao =
        await UserInscricaoRepository.findUserInscricaoById(user_id, lote_id);
      const lote = await BatchRepository.findBatchById(lote_id);

      const response = {
        user_name: user.nome,
        email: user.email,
        nome_cracha: user.nome_cracha,
        instituicao: user.instituicao,
        inscricao: {
          status: user_inscricao?.status_pagamento,
          nome_lote: lote.name,
          preco: lote.price,
          uuid_evento: lote.eventId,
        },
        atividades: atividades.map((atividade: any) => ({
          nome: atividade.nome,
          tipo_atividade: atividade.tipo_atividade,
          uuid_atividade: atividade.uuid_atividade,
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

      if (user_inscricao?.id_payment_mercado_pago) {
        const payment = await getPayment(
          user_inscricao!.id_payment_mercado_pago
        );

        return res.status(200).json(payment);
      }

      return res.status(200).json({ message: "Inscrição Gratuita" });
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

  static async findAllUserInscricao(req: Request, res: Response) {
    try {
      const { lote_id } = req.params;

      const user_inscricao = await prisma.userInscricao.findMany({
        where: {
          uuid_lote: lote_id,
          AND: {
            status_pagamento: "PENDENTE",
          },
        },
        select: {
          status_pagamento: true,
          usuario: {
            select: {
              nome: true,
              email: true,
            },
          },
          id_payment_mercado_pago: true,
        },
      });

      const pagamentos = [];

      for (const item of user_inscricao) {
        if (item.id_payment_mercado_pago) {
          const pagamento = await getPayment(item.id_payment_mercado_pago);
          pagamentos.push(item, pagamento);
        }
      }

      res.status(200).json({
        pagamentos,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }

  static async findUser(req: Request, res: Response) {
    try {
      const { id } = res.locals;

      const user = await UserRepository.findUserById(id);

      const { uuid_user: _, senha, ...userWithoutSensitiveData } = user;

      res.status(200).json(userWithoutSensitiveData);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const requestPasswordResetSchema = z.object({
        email: z.string().email("Invalid email format"),
      });

      const { email } = requestPasswordResetSchema.parse(req.body);

      const user = await UserRepository.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const token = crypto.randomUUID();
      await UserRepository.updateUserRecoverInfo(
        email,
        token,
        new Date(Date.now() + 3600000)
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);

      return res
        .status(200)
        .json({ message: "E-mail de recuperação de senha enviado!" });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json(formattedErrors);
      }

      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: error });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const resetPasswordSchema = z.object({
        token: z.string(),
        newPassword: z
          .string()
          .min(8, "A senha precisa ter pelo menos 8 caracteres"),
      });

      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      const user = await UserRepository.findUserByToken(token);
      if (!user) {
        return res.status(400).json({ message: "Token inválido ou expirado" });
      }

      const hashedPassword = await encryptPassword(newPassword);

      await UserRepository.updateUserPassword(user.email, hashedPassword);

      return res.status(200).json({ message: "Senha redefinida com sucesso!" });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json(formattedErrors);
      }

      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: error });
    }
  }
}
