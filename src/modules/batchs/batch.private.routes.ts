import express from "express";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";

const BatchPrivateRoutes = express.Router();
BatchPrivateRoutes.use(checkToken);

BatchPrivateRoutes.put(
  "/lote/:lote_id/inscricoes/:user_id",
  UserController.updatePaymentStatus
);

/**
 * @openapi
 * /lote/{lote_id}/register:
 *   post:
 *     tags:
 *       - Batchs
 *     summary: Register a participant in an event
 *     parameters:
 *       - in: path
 *         name: lote_id
 *         description: The unique identifier of the event batch (lote).
 *         required: true
 *         schema:
 *           type: string
 *           example: "12345"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserInEvent'
 *     responses:
 *       201:
 *         description: User successfully registered.
 *       400:
 *         description: Validation error.
 */
BatchPrivateRoutes.post(
  "/lote/:lote_id/register",
  EventController.registerParticipanteInEvent
);

export default BatchPrivateRoutes;
