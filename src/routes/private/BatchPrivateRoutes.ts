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

//receber os dados do cartao caso o pagamento seja necessário
/*
    token: 'SEU_TOKEN_DO_CARTAO',
    description: 'Descrição do produto',
    installments: 1,
    payment_method_id: 'visa',
*/
BatchPrivateRoutes.post("/lote/:lote_id/register", EventController.registerParticipanteInEvent);

export default BatchPrivateRoutes;
