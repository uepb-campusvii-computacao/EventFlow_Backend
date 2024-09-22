import express from "express";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";
import { verifyAdminUserRole } from "../../middlewares/verifyUsersRoles";

const EventPrivateRoutes = express.Router();

EventPrivateRoutes.get(
  "/events/:event_id/inscricao/:user_id",
  [checkToken, verifyAdminUserRole],
  UserController.getUserInEvent
);

EventPrivateRoutes.get(
  "/events/:event_id/dashboard",
  [checkToken, verifyAdminUserRole],
  EventController.getFinancialInformation
);

EventPrivateRoutes.get(
  "/events/:id_evento/inscricoes",
  [checkToken, verifyAdminUserRole],
  EventController.getAllSubscribersInEvent
);

EventPrivateRoutes.put(
  "/events/:event_id/inscricoes/credenciamento/:user_id",
  [checkToken, verifyAdminUserRole],
  EventController.changeEventCredenciamentoValue
);

EventPrivateRoutes.get(
  "/events/:id_evento/atividades",
  [checkToken, verifyAdminUserRole],
  EventController.getAllActivitiesInEvent
);

EventPrivateRoutes.get(
  "/events/:id_evento/inscricoes/todos",
  [checkToken, verifyAdminUserRole],
  EventController.getAllFinancialInformationsInEvent
);

export default EventPrivateRoutes;
