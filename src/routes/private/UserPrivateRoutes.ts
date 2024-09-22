import express from "express";
import ActivityController from "../../controllers/ActivityController";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";
import { verifyAdminUserRole } from "../../middlewares/verifyUsersRoles";

const UserPrivateRoutes = express.Router();
UserPrivateRoutes.use(checkToken);

UserPrivateRoutes.put(
  "/user/:user_id",
  verifyAdminUserRole,
  EventController.updateParticipantInformations
);

UserPrivateRoutes.delete(
  "/user/:user_id",
  verifyAdminUserRole,
  UserController.deleteUser
);

UserPrivateRoutes.get(
  "/user/:user_id/events",
  verifyAdminUserRole,
  EventController.getAllEventsByIdUser
);

UserPrivateRoutes.put(
  "/user/:user_id/atividades/troca",
  verifyAdminUserRole,
  ActivityController.upadateUserActivity
);

export default UserPrivateRoutes;
