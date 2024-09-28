import express from "express";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";

const UserPublicRoutes = express.Router();

UserPublicRoutes.post("/login",UserController.loginUser);
UserPublicRoutes.post("/register/:event_id", EventController.registerParticipanteInEvent);


export default UserPublicRoutes;