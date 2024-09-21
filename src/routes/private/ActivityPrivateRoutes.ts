import express from "express";
import ActivityController from "../../controllers/ActivityController";
import { checkToken } from "../../lib/ensureAuthenticate";

const ActivityPrivateRoutes = express.Router();
ActivityPrivateRoutes.use(checkToken);

ActivityPrivateRoutes.get(
  "/atividades/:id_atividade/inscricoes",
  ActivityController.getSubscribersInActivity
);

ActivityPrivateRoutes.get(
  "/atividades/:atividade_id",
  ActivityController.getActivityById
);

ActivityPrivateRoutes.put(
  "/atividades/:atividade_id",
  ActivityController.updateActivity
);

ActivityPrivateRoutes.put(
  "/atividades/:atividade_id/inscricoes/:user_id/frequencia",
  ActivityController.changeActivityPresencaValue
);

export default ActivityPrivateRoutes;
