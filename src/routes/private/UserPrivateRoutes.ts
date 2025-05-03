import express from "express";
import ActivityController from "../../controllers/ActivityController";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";
import { verifyAdminUserRoleInEvent } from "../../middlewares/verifyUsersRoles";

const UserPrivateRoutes = express.Router();
UserPrivateRoutes.use(checkToken);

UserPrivateRoutes.get("/user/", UserController.findUser);

UserPrivateRoutes.put(
  "/user/:user_id",
  EventController.updateParticipantInformations
);

UserPrivateRoutes.delete(
  "/user/:user_id",
  verifyAdminUserRoleInEvent,
  UserController.deleteUser
);

UserPrivateRoutes.get("/user/my-events", EventController.getAllEventsByIdUser);

UserPrivateRoutes.get(
  "/user/in-event/:event_id",
  EventController.checkUserRegistrationInEvent
);

UserPrivateRoutes.put(
  "/user/:user_id/atividades/troca",
  ActivityController.upadateUserActivity
);

UserPrivateRoutes.get(
  "/user/events/:event_id/my-activities",
  EventController.getAllActivitiesInEventByUser
);

// caso queira desacoplar a criação de um usuário convidado do registro em um evento
// UserPrivateRoutes.post("/user/registerGuest", UserController.registerGuest);

UserPrivateRoutes.get("/user/profile", UserController.profile);

UserPrivateRoutes.get("/user/profile/events", UserController.getUserEvents);

UserPrivateRoutes.get(
  "/user/profile/activities",
  UserController.getUserActivities
);

export default UserPrivateRoutes;
