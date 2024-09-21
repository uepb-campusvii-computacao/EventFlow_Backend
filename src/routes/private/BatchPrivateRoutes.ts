import express from "express";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../lib/ensureAuthenticate";

const BatchPrivateRoutes = express.Router();
BatchPrivateRoutes.use(checkToken);

BatchPrivateRoutes.put("/lote/:lote_id/inscricoes/:user_id", UserController.updatePaymentStatus);

export default BatchPrivateRoutes;