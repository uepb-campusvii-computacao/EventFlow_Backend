import express from "express";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";
import { verifyAdminUserRole } from "../../middlewares/verifyUsersRoles";

const BatchPrivateRoutes = express.Router();

BatchPrivateRoutes.put(
  "/lote/:lote_id/inscricoes/:user_id",
  [checkToken, verifyAdminUserRole],
  UserController.updatePaymentStatus
);

export default BatchPrivateRoutes;
