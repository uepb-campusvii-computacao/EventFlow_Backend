import { StatusPagamento } from "@prisma/client";
import { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { z, ZodError } from "zod";
import { FindLoteIdAnduserIdParams } from "../interfaces/findLoteIdAnduserIdParams";
import { UpdatePaymentStatusParams } from "../interfaces/updatePaymentStatusParams";
import { UserLoginParams } from "../interfaces/userLoginParams";
import { prisma } from "../lib/prisma";
import LoteRepository from "../repositories/LoteRepository";
import UserAtividadeRepository from "../repositories/UserAtividadeRepository";
import UserInscricaoRepository from "../repositories/UserInscricaoRepository";
import UserRepository from "../repositories/UserRepository";
import { sendPasswordResetEmail } from "../services/emailService";
import {
  getPayment,
  getPaymentStatusForInscricao,
  getPaymentStatusForMultipleSubscriptions,
} from "../services/payments/getPayment";
import { checkPassword } from "../services/user/checkPassword";
import { deleteUserByUserId } from "../services/user/deleteUserByUserId";
import { encryptPassword } from "../services/user/encryptPassword";
import { UserService } from "../services/user/user.service";

export default class UserController {
  static async loginUser(req: Request, res: Response) {
    const params: UserLoginParams = req.body;

    const { email, senha } = params;

    const userExists = await UserRepository.findUserByEmail(email);

    if (!userExists) {
      return res.status(403).send("Email não encontrado");
    }

    const password_encrypted = userExists.senha || "";

    const check_password = await checkPassword(senha, password_encrypted);

    if (!check_password) {
      return res.status(403).send("Senha inválida!");
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
          cpf: z
            .string()
            .length(14, "CPF deve conter o formato xxx.xxx.xxx-xx"),
          email: z.string().email("Email com formato inválido"),
          nickname: z.string(),
          organization: z.string(),
          password: z
            .string()
            .min(8, "A senha deve conter pelo menos 8 caracteres"),
          confirm_password: z.string(),
        })
        .refine((data) => data.password === data.confirm_password, {
          message: "As senhas divergem",
          path: ["confirm_password"],
        });

      const { name, cpf, email, nickname, password, organization } =
        registerUserSchema.parse(req.body);

      const password_encrypted = await encryptPassword(password);

      const user = await UserRepository.createUser({
        nome: name,
        cpf: cpf,
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
        .json({ message: "Um erro inesperado aconteceu", error: error });
    }
  }

  static async registerGuest(req: Request, res: Response) {
    try {
      const registerGuestSchema = z.object({
        name: z.string(),
        cpf: z.string().length(14, "CPF deve conter o formato xxx.xxx.xxx-xx"),
        email: z.string().email(),
        nickname: z.string(),
        organization: z.string(),
      });

      const { name, cpf, email, nickname, organization } =
        registerGuestSchema.parse(req.body);

      const guest = await UserService.registerGuest({
        name,
        cpf,
        email,
        nickname,
        organization,
      });

      return res.status(201).json(guest);
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
        .json({ message: "Um erro inesperado aconteceu", error: error });
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

  static async paymentUpdatePix(req: Request, res: Response) {
    try {
      const { lote_id, user_id } = req.params;
      const { action } = req.body;
      if (action === "payment.updated") {
        const [res, user_inscricao] = await Promise.all([
          getPaymentStatusForInscricao(user_id, lote_id),
          UserInscricaoRepository.findUserInscricaoById(user_id, lote_id),
        ]);

        if (
          res.status &&
          user_inscricao?.status_pagamento !== StatusPagamento.GRATUITO
        ) {
          await UserInscricaoRepository.changeStatusPagamentoPix(
            user_id,
            lote_id,
            res.status
          );
        }
      }
      return res.status(200).send("Valor alterado");
    } catch (error) {
      return res.status(400).send("Informações inválidas");
    }
  }
  static async paymentUpdateCard(req: Request, res: Response) {
    console.log("Requisitando pagamento do cartão de crédito...");
    try {
      const { lote_id, user_id } = req.params;
      const { action } = req.body;
      console.log(action);
      if (action === "payment.created" || action === "payment.updated") {
        const [res, user_inscricao] = await Promise.all([
          getPaymentStatusForInscricao(user_id, lote_id),
          UserInscricaoRepository.findUserInscricaoById(user_id, lote_id),
        ]);
        console.log(`Pagamento atualizado: ${res}`);
        if (
          //isso ta feio: refatore isso
          res.status &&
          res.status_detail &&
          res.payment_type_id &&
          res.last_four_digits &&
          user_inscricao?.status_pagamento !== StatusPagamento.GRATUITO
        ) {
          await UserInscricaoRepository.changeStatusPagamentoCard(
            user_id,
            lote_id,
            res.status,
            res.status_detail,
            res.payment_type_id,
            res.last_four_digits
          );
        }
      }
      return res.status(200).send("Valor alterado");
    } catch (error) {
      return res.status(400).send("Informações inválidas");
    }
  }

  static async realizarPagamentoMultipleUsers(req: Request, res: Response) {
    try {
      const { lote_id, users_ids } = req.params;
      const { action } = req.body;

      const usersIdsSplitted = users_ids.split(";");
      const payerId = usersIdsSplitted[usersIdsSplitted.length - 1];

      if (action === "payment.updated") {
        const statusPromise = getPaymentStatusForMultipleSubscriptions(
          payerId,
          lote_id
        );
        const usersSubscriptionsPromise = prisma.userInscricao.findMany({
          where: {
            uuid_lote: lote_id,
            usuario: {
              uuid_user: { in: usersIdsSplitted },
            },
          },
        });

        const [status, usersSubscriptions] = await Promise.all([
          statusPromise,
          usersSubscriptionsPromise,
        ]);

        if (usersSubscriptions.length !== usersIdsSplitted.length) {
          throw new Error("One or more users not found");
        }

        if (
          status &&
          usersSubscriptions.every(
            (user) => user.status_pagamento !== StatusPagamento.GRATUITO
          )
        ) {
          await prisma.userInscricao.updateMany({
            where: {
              uuid_lote: lote_id,
              usuario: { uuid_user: { in: usersIdsSplitted } },
            },
            data: { status_pagamento: status },
          });
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
        nome_cracha: user.nome_cracha,
        instituicao: user.instituicao,
        inscricao: {
          status: user_inscricao?.status_pagamento,
          nome_lote: lote.nome,
          preco: lote.preco,
          uuid_evento: lote.uuid_evento,
        },
        atividades: atividades.map((atividade) => ({
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

      await UserInscricaoRepository.changeStatusPagamentoPix(
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
        email: z.string().email("Email com formato inválido"),
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
        .json({ message: "Um erro inesperado aconteceu.", error: error });
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
        .json({ message: "Um erro inesperado aconteceu.", error: error });
    }
  }
  //gerenciador de inscrições
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
          lote: {
            select: {
              uuid_evento: true,
            },
          },
          id_payment_mercado_pago: true,
        },
      });

      const pagamentos = [];

      for (const item of user_inscricao) {
        if (item.id_payment_mercado_pago) {
          const pagamento = await getPayment(
            item.id_payment_mercado_pago,
            item.lote.uuid_evento
          );
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
  static async getUserInscricao(req: Request, res: Response) {
    try {
      const { user_id, lote_id } = req.params;

      const user_inscricao =
        await UserInscricaoRepository.findUserInscricaoById(user_id, lote_id);

      const { uuid_evento } = await LoteRepository.findLoteById(lote_id);

      if (user_inscricao?.id_payment_mercado_pago) {
        const payment = await getPayment(
          user_inscricao!.id_payment_mercado_pago,
          uuid_evento
        );

        return res.status(200).json(payment);
      }

      return res.status(200).json({ message: "Inscrição Gratuita" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  static async profile(req: Request, res: Response) {
    try {
      const { id } = res.locals;

      const user = await UserService.getProfile(id);

      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: "Um erro inesperado aconteceu", error: error });
    }
  }

  static async getUserEvents(req: Request, res: Response) {
    try {
      const { id } = res.locals;

      const userEvents = await UserService.getUserEvents(id);

      if (!userEvents) {
        return res.status(404).json({ message: "Eventos não encontrados" });
      }

      res.status(200).json(userEvents);
    } catch (error) {
      res.status(400).send(error);
    }
  }
}
