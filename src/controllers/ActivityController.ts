import { Request, Response } from "express";
import { ZodError } from "zod";
import { ChangeActivityParamsRequest } from "../interfaces/changeActivityParamsRequest";
import ActivityRepository from "../modules/activities/activity.repository";
import { createActivitySchema } from "../modules/activities/schemas/createActivity.schema";
import { updateActivitySchema } from "../modules/activities/schemas/updateActivity.schema";
import UserAtividadeRepository from "../repositories/UserAtividadeRepository";

export default class ActivityController {
  static async getSubscribersInActivity(req: Request, res: Response) {
    const { atividade_id } = req.params;

    const subscribers =
      await UserAtividadeRepository.findAllSubscribersInActivity(atividade_id);

    if (!subscribers) {
      return res.status(400).send("Atividade não encontrada");
    }

    return res.status(200).json(subscribers);
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

      return res.status(200).json(activity);
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

      let max_participants = Number(activity_exists.maxParticipants);

      let total_participants = (
        await UserAtividadeRepository.findAllSubscribersInActivity(
          uuid_atividade_nova
        )
      ).length;

      if (total_participants >= max_participants) {
        throw new Error(`A atividade ${activity_exists.name} já está completa`);
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

      const body = updateActivitySchema.parse(req.body);

      const activity = await ActivityRepository.updateActivityById(atividade_id, body);

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
      const uuid_user = res.locals.id;

      const uuid_evento = req.params.event_id;

      const createActivityParams = createActivitySchema.parse(req.body);

      const activity = await ActivityRepository.createActivity(createActivityParams);

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
}
