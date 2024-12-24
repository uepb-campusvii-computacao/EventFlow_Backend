import express from "express";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";
import { verifyAdminUserRoleInEvent } from "../../middlewares/verifyUsersRoles";
import ActivityService from "../../modules/activities/activity.service";


const UserPrivateRoutes = express.Router();
UserPrivateRoutes.use(checkToken);

UserPrivateRoutes.get(
  "/user/",
  UserController.findUser
);

UserPrivateRoutes.put(
  "/user/:user_id",
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

UserPrivateRoutes.get(
  "/user/in-event/:event_id",
  EventController.checkUserRegistrationInEvent
);

UserPrivateRoutes.put(
  "/user/:user_id/atividades/troca",
  ActivityService.upadateUserActivity
);

UserPrivateRoutes.get(
  "/user/events/:event_id/my-activities",
  EventController.getAllActivitiesInEventByUser
);

export default UserPrivateRoutes;
