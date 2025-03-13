import express from "express";
import EventController from "../../controllers/EventController";
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

BatchPublicRoutes.post(
  "/lote/:lote_id/mutiple-users/:users_ids/realizar-pagamento",
  UserController.realizarPagamentoMultipleUsers
);

BatchPublicRoutes.put(
  "/lote/:lote_id/change_inscricoes_visibility",
  EventController.toggleLoteAtivo
);

export default BatchPublicRoutes;
