import { Request, Response } from "express";
import { ZodError } from "zod";
import ActivityRepository from "../../modules/activities/activity.repository";
import { createActivitySchema } from "../../modules/activities/schemas/createActivity.schema";
import { updateActivitySchema } from "../../modules/activities/schemas/updateActivity.schema";
import { changeUserActivitiesSchema } from "../../modules/userActivities/schemas/changeUserActivities.schema";
import UserActivityRepository from "../../modules/userActivities/userActivities.repository";

export default class ActivityService {
  static async getSubscribersInActivity(req: Request, res: Response) {
    const { atividade_id } = req.params;

    const subscribers =
      await UserActivityRepository.findAllSubscribersInActivity(atividade_id);

    if (!subscribers) {
      return res.status(400).send("Atividade não encontrada");
    }

    return res.status(200).json(subscribers);
  }

  static async changeActivityPresencaValue(req: Request, res: Response) {
    try {
      const { atividade_id, user_id } = req.params;

      const activity = await UserActivityRepository.findUserActivityDetails(
        atividade_id,
        user_id
      );

      await UserActivityRepository.toggleIsPresentValueInActivity(
        atividade_id,
        user_id,
        !activity?.isPresent
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
      const { currentActivityId, newActivityId } =
        changeUserActivitiesSchema.parse(req.body);

      const activityExists = await ActivityRepository.findActivityById(
        newActivityId
      );

      if (!activityExists) {
        throw new Error("UUID inválido!");
      }

      if (
        activityExists.maxParticipants &&
        activityExists.numberOfRegistrations >= activityExists.maxParticipants
      ) {
        throw new Error(`A atividade ${activityExists.name} já está completa`);
      }

      if (currentActivityId == "") {
        await UserActivityRepository.createUserActivity(user_id, newActivityId);
      } else {
        await UserActivityRepository.changeUserActivities(
          currentActivityId,
          newActivityId,
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

      const activity = await ActivityRepository.updateActivityById(
        atividade_id,
        body
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
      const uuid_user = res.locals.id;

      const uuid_evento = req.params.event_id;

      const createActivityParams = createActivitySchema.parse(req.body);

      const activity = await ActivityRepository.createActivity(
        createActivityParams
      );

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
