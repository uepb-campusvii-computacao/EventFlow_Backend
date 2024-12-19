import express from "express";
import UserController from "../../controllers/UserController";

const BatchPublicRoutes = express.Router();

BatchPublicRoutes.get(
  "/lote/:lote_id/inscricoes/user/:user_id/",
  UserController.getUserInformation
);

BatchPublicRoutes.post(
  "/lote/:lote_id/user/:user_id/realizar-pagamento",
  UserController.realizarPagamento
);

export default BatchPublicRoutes;
