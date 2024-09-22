import express from "express";
import ActivityController from "../../controllers/ActivityController";
import { checkToken } from "../../middlewares/ensureAuthenticate";
import { verifyAdminUserRole } from "../../middlewares/verifyUsersRoles";

const ActivityPrivateRoutes = express.Router();

ActivityPrivateRoutes.get(
  "/atividades/:id_atividade/inscricoes",
  [checkToken, verifyAdminUserRole],
  ActivityController.getSubscribersInActivity
);

ActivityPrivateRoutes.get(
  "/atividades/:atividade_id",
  [checkToken, verifyAdminUserRole],
  ActivityController.getActivityById
);

ActivityPrivateRoutes.put(
  "/atividades/:atividade_id",
  [checkToken, verifyAdminUserRole],
  ActivityController.updateActivity
);

ActivityPrivateRoutes.put(
  "/atividades/:atividade_id/inscricoes/:user_id/frequencia",
  [checkToken, verifyAdminUserRole],
  ActivityController.changeActivityPresencaValue
);

export default ActivityPrivateRoutes;
