import express from "express";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";

const BatchPrivateRoutes = express.Router();
BatchPrivateRoutes.use(checkToken)

BatchPrivateRoutes.put(
  "/lote/:lote_id/inscricoes/:user_id",
  UserController.updatePaymentStatus
);

BatchPrivateRoutes.post("/lote/:lote_id/register", EventController.registerParticipanteInEvent);

export default BatchPrivateRoutes;
