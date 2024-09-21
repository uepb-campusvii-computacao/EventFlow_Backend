import express from "express";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../lib/ensureAuthenticate";

const EventPrivateRoutes = express.Router();
EventPrivateRoutes.use(checkToken);

EventPrivateRoutes.get(
  "/events/:event_id/inscricao/:user_id",
  UserController.getUserInEvent
);

EventPrivateRoutes.get(
  "/events/:event_id/dashboard",
  EventController.getFinancialInformation
);

EventPrivateRoutes.get(
  "/events/:id_evento/inscricoes",
  EventController.getAllSubscribersInEvent
);

EventPrivateRoutes.put(
  "/events/:event_id/inscricoes/credenciamento/:user_id",
  EventController.changeEventCredenciamentoValue
);

EventPrivateRoutes.get(
  "/events/:id_evento/atividades",
  EventController.getAllActivitiesInEvent
);

EventPrivateRoutes.get(
  "/events/:id_evento/inscricoes/todos",
  EventController.getAllFinancialInformationsInEvent
);

export default EventPrivateRoutes;
