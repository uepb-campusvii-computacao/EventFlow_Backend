import express from "express";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";
import { verifyAdminUserRoleInEvent } from "../../middlewares/verifyUsersRoles";
import ActivityService from "../../modules/activities/activity.service";

const EventPrivateRoutes = express.Router();
EventPrivateRoutes.use(checkToken)

EventPrivateRoutes.get(
  "/events/:event_id/inscricao/:user_id",
  verifyAdminUserRoleInEvent,
  UserController.getUserInEvent
);

EventPrivateRoutes.get(
  "/events/:event_id/dashboard",
  verifyAdminUserRoleInEvent,
  EventController.getFinancialInformation
);

EventPrivateRoutes.get(
  "/events/:event_id/inscricoes",
  verifyAdminUserRoleInEvent,
  EventController.getAllSubscribersInEvent
);

EventPrivateRoutes.put(
  "/events/:event_id/inscricoes/credenciamento/:user_id",
  verifyAdminUserRoleInEvent,
  EventController.changeEventCredenciamentoValue
);

EventPrivateRoutes.get(
  "/events/:event_id/atividades",
  verifyAdminUserRoleInEvent,
  EventController.getAllActivitiesInEvent
);

EventPrivateRoutes.get(
  "/events/:event_id/inscricoes/todos",
  verifyAdminUserRoleInEvent,
  EventController.getAllFinancialInformationsInEvent
);

EventPrivateRoutes.post(
  "/events/create",
  EventController.createEvent
);

EventPrivateRoutes.post(
  "/events/:event_id/atividades/create",
  verifyAdminUserRoleInEvent,
  ActivityService.createActivity
);

export default EventPrivateRoutes;
