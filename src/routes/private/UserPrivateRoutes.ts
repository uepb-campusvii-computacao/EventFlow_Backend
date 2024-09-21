import express from "express";
import ActivityController from "../../controllers/ActivityController";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";

const UserPrivateRoutes = express.Router();

UserPrivateRoutes.put(
  "/user/:user_id",
  EventController.updateParticipantInformations
);

UserPrivateRoutes.delete("/user/:user_id", UserController.deleteUser);

UserPrivateRoutes.get(
  "/user/:user_id/events",
  EventController.getAllEventsByIdUser
);

UserPrivateRoutes.put(
  "/user/:user_id/atividades/troca",
  ActivityController.upadateUserActivity
);

export default UserPrivateRoutes;
