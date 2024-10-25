import express from "express";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";

const EventPublicRoutes = express.Router();

EventPublicRoutes.get("/events", EventController.getAllEvents);

EventPublicRoutes.get(
  "/events/:event_id/lotes",
  EventController.getLotesInEvent
);

EventPublicRoutes.get(
  "/events/:event_id/all/lotes",
  EventController.getAllLotesInEvent
);

EventPublicRoutes.post(
  "/events/:event_id/inscricoes/find",
  UserController.getLoteIdAndUserId
);

EventPublicRoutes.get(
  "/events/:id_evento/atividades",
  EventController.getAllActivitiesInEventOrdenateByTipo
);

export default EventPublicRoutes;
