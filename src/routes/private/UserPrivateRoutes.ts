import express from "express";
import ActivityController from "../../controllers/ActivityController";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";
import { verifyAdminUserRoleInEvent } from "../../middlewares/verifyUsersRoles";


const UserPrivateRoutes = express.Router();
UserPrivateRoutes.use(checkToken);

UserPrivateRoutes.put(
  "/user/:user_id",
  verifyAdminUserRoleInEvent,
  EventController.updateParticipantInformations
);

UserPrivateRoutes.delete(
  "/user/:user_id",
  verifyAdminUserRoleInEvent,
  UserController.deleteUser
);

UserPrivateRoutes.get(
  "/user/my-events",
  EventController.getAllEventsByIdUser
);

UserPrivateRoutes.put(
  "/user/:user_id/atividades/troca",
  verifyAdminUserRoleInEvent,
  ActivityController.upadateUserActivity
);

export default UserPrivateRoutes;
