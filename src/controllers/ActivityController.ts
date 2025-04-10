import { TipoAtividade, TurnoAtividade } from "@prisma/client";
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { ChangeActivityParamsRequest } from "../interfaces/changeActivityParamsRequest";
import { UpdateActivityParams } from "../interfaces/updateActivityParams";
import ActivityRepository from "../repositories/ActivityRepository";
import UserAtividadeRepository from "../repositories/UserAtividadeRepository";

export default class ActivityController {
  static async getSubscribersInActivity(req: Request, res: Response) {
    const { atividade_id } = req.params;

    const subscribers =
      await UserAtividadeRepository.findAllSubscribersInActivity(atividade_id);

    if (!subscribers) {
      return res.status(400).send("Atividade não encontrada");
    }

    return res.status(200).json(
      subscribers.map((subscriber) => ({
        uuid_user: subscriber.uuid_user,
        presenca: subscriber.presenca,
        ...subscriber.user,
      }))
    );
  }

  static async changeActivityPresencaValue(req: Request, res: Response) {
    try {
      const { atividade_id, user_id } = req.params;

      const activity = await UserAtividadeRepository.findUserAtividadeById(
        atividade_id,
        user_id
      );

      await UserAtividadeRepository.changePresencaValueInActivity(
        atividade_id,
        user_id,
        !activity?.presenca
      );

      return res.status(200).send("Valor alterado com sucesso!");
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async getActivityById(req: Request, res: Response) {
    try {
      const { atividade_id } = req.params;

      const activity = await ActivityRepository.findActivityPubInfoById(
        atividade_id
      );

      return res.status(200).json({ ...activity });
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async upadateUserActivity(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const {
        uuid_atividade_atual,
        uuid_atividade_nova,
      }: ChangeActivityParamsRequest = req.body;

      const activity_exists = await ActivityRepository.findActivityById(
        uuid_atividade_nova
      );

      if (!activity_exists) {
        throw new Error("UUID inválido!");
      }

      let max_participants = Number(activity_exists.max_participants);

      let total_participants = (
        await UserAtividadeRepository.findAllSubscribersInActivity(
          uuid_atividade_nova
        )
      ).length;

      if (total_participants >= max_participants) {
        throw new Error(`A atividade ${activity_exists.nome} já está completa`);
      }

      if (uuid_atividade_atual == "") {
        await UserAtividadeRepository.createUserAtividade(
          user_id,
          uuid_atividade_nova
        );
      } else {
        await UserAtividadeRepository.changeUserAtividade(
          uuid_atividade_atual,
          uuid_atividade_nova,
          user_id
        );
      }

      return res.status(200).send("Alterado com sucesso");
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async updateActivity(req: Request, res: Response) {
    try {
      const { atividade_id } = req.params;

      const {
        nome,
        descricao,
        tipo_atividade,
        max_participants,
      }: UpdateActivityParams = req.body;

      const activity = await ActivityRepository.updateActivityById(
        atividade_id,
        nome,
        descricao,
        tipo_atividade,
        Number(max_participants)
      );

      if (!activity) {
        throw new Error("Falha ao atualizar atividade");
      }

      return res.status(200).json(activity);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async createActivity(req: Request, res: Response) {
    try {
      const uuid_evento = req.params.event_id;

      const createActivityParams = z
        .object({
          nome: z.string(),
          max_participants: z.number().optional(),
          data: z.preprocess((arg) => {
            if (typeof arg === "string" || arg instanceof Date)
              return new Date(arg);
          }, z.date().optional()),
          descricao: z.string(),
          tipo_atividade: z.nativeEnum(TipoAtividade),
          turno: z.nativeEnum(TurnoAtividade).optional(),
        })
        .parse(req.body) as {
          nome: string;
          max_participants?: number;
          data?: Date;
          descricao: string;
          tipo_atividade: TipoAtividade;
          turno?: TurnoAtividade;
        };
        
      const activity = await ActivityRepository.createActivity({
        uuid_evento,
        ...createActivityParams,
      });

      return res.status(200).json(activity);
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

  static async getActivitiesByShift(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      if (!event_id) {
        return res
          .status(400)
          .json({ message: "O id do evento é obrigatório" });
      }

      const { turno } = req.query;

      const activities = await ActivityRepository.findActivitiesByShift(
        (turno as TurnoAtividade) || null,
        event_id
      );

      return res.status(200).json(activities);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: "Erro inesperado.", error });
    }
  }

  static async getAllActivitiesByShift(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      if (!event_id) {
        return res
          .status(400)
          .json({ message: "O id do evento é obrigatório" });
      }

      const activities = await ActivityRepository.findAllActivitiesByShift(
        event_id
      );

      return res.status(200).json(activities);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: "Erro inesperado.", error });
    }
  }
}
