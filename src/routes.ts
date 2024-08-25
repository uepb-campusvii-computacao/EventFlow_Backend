import { Router } from "express";

import ActivityController from "./controllers/ActivityController";
import EventController from "./controllers/EventController";
import {
  getProductInMarket,
  getUsersWithOrders,
  updateProductInMarket,
} from "./controllers/marketController";
import {
  createOrder,
  getOrders,
  getOrdersByUserAndProduct,
  realizarPagamentoVenda,
} from "./controllers/orderController";
import UserController from "./controllers/UserController";
import { checkToken } from "./lib/ensureAuthenticate";

const routes = Router();

// Rotas Públicas (Mercardo)

routes.post("/", UserController.gerarSenha);

routes.post("/marketplace", createOrder);
routes.get("/marketplace/user/:user_id", getOrders);
routes.post(
  "/marketplace/:pagamento_id/realizar-pagamento",
  realizarPagamentoVenda
);
routes.get("/events/:event_id/produtos", EventController.getAllProductsInEvent);

// Rotas Públicas
routes.post("/login",UserController.loginUser);
routes.get("/events", EventController.getAllEvents);
routes.get("/events/:event_id/lotes", EventController.getLotesInEvent);
routes.post("/register/:event_id", EventController.registerParticipanteInEvent);
routes.post("/events/:event_id/inscricoes/find", UserController.getLoteIdAndUserId);
routes.get("/lote/:lote_id/inscricoes/user/:user_id/", UserController.getUserInformation);
routes.post(
  "/lote/:lote_id/user/:user_id/realizar-pagamento",
  UserController.realizarPagamento
);
routes.get(
  "/events/:id_evento/atividades",
  EventController.getAllActivitiesInEventOrdenateByTipo
);
routes.get("/pagamento/user/:user_id/lote/:lote_id", UserController.getUserInscricao);

routes.get(
  "/admin/events/:id_evento/inscricoes/todos",
  EventController.getAllFinancialInformationsInEvent
);

// Rotas para usuários (com autenticação)
const userRoutes = Router();
userRoutes.use(checkToken);
userRoutes.get("/event/:event_id/inscricao/:user_id", UserController.getUserInEvent);
userRoutes.put("/admin/user/:user_id", EventController.updateParticipantInformations);
userRoutes.delete("/admin/user/:user_id", UserController.deleteUser);
userRoutes.put("/admin/lote/:lote_id/inscricoes/:user_id", UserController.updatePaymentStatus);

// Rotas para eventos (com autenticação)
const eventRoutes = Router();
eventRoutes.use(checkToken);
eventRoutes.get("/admin/events/:event_id/dashboard", EventController.getFinancialInformation);
eventRoutes.get("/admin/user/:user_id/events", EventController.getAllEventsByIdUser);
eventRoutes.get(
  "/admin/events/:id_evento/inscricoes",
  EventController.getAllSubscribersInEvent
);
eventRoutes.put(
  "/admin/events/:event_id/inscricoes/credenciamento/:user_id",
  EventController.changeEventCredenciamentoValue
);
eventRoutes.get("/admin/events/:id_evento/atividades", EventController.getAllActivitiesInEvent);

// Rotas para atividades (com autenticação)
const activityRoutes = Router();
activityRoutes.use(checkToken);
activityRoutes.get(
  "/admin/atividades/:id_atividade/inscricoes",
  ActivityController.getSubscribersInActivity
);
activityRoutes.get("/admin/atividades/:atividade_id", ActivityController.getActivityById);
activityRoutes.put("/admin/atividades/:atividade_id", ActivityController.updateActivity);
activityRoutes.put(
  "/admin/atividades/:atividade_id/inscricoes/:user_id/frequencia",
  ActivityController.changeActivityPresencaValue
);
activityRoutes.put(
  "/admin/user/:user_id/atividades/troca",
  ActivityController.upadateUserActivity
);

// Rotas para o mercado (com autenticação)
const marketRoutes = Router();
marketRoutes.use(checkToken);
marketRoutes.put("/admin/loja/produtos/:produto_id", updateProductInMarket);
marketRoutes.get("/admin/loja/produtos/:produto_id", getProductInMarket);
marketRoutes.get("/admin/loja/produtos/:produto_id/compradores", getUsersWithOrders);
marketRoutes.get("/admin/loja/usuario/:user_id/compras/produto/:produto_id", getOrdersByUserAndProduct);

// Monta os sub-routers no Router principal
routes.use("/", userRoutes);
routes.use("/", eventRoutes);
routes.use("/", activityRoutes);
routes.use("/", marketRoutes);

export default routes;
