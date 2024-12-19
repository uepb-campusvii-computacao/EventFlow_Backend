import express from "express";
import EventController from "../../controllers/EventController";
import UserController from "../../controllers/UserController";
import { checkToken } from "../../middlewares/ensureAuthenticate";
import BatchService from "./batch.service";

const service = BatchService;

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

/**
 * @openapi
 * /lote/:lote_id/change_inscricoes_visibility:
 *   put:
 *     tags:
 *        - Batchs
 *     summary: Toggles the status of a batch.
 *     parameters:
 *       - name: lote_id
 *         in: path
 *         description: Batch ID to be changed
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Campo ativo do lote alternado com sucesso!"
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao alternar o campo ativo do lote."
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lote não encontrado."
 */
BatchPrivateRoutes.put(
  "/lote/:lote_id/change_inscricoes_visibility",
  service.toggleBatchActiveStatus
);

export default BatchPrivateRoutes;
