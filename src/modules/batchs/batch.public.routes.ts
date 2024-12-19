import express from "express";
import UserController from "../../controllers/UserController";
import BatchService from "./batch.service";

const BatchPublicRoutes = express.Router();

const service = new BatchService();

BatchPublicRoutes.get(
  "/lote/:lote_id/inscricoes/user/:user_id/",
  UserController.getUserInformation
);

BatchPublicRoutes.post(
  "/lote/:lote_id/user/:user_id/realizar-pagamento",
  UserController.realizarPagamento
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
BatchPublicRoutes.put(
  "/lote/:lote_id/change_inscricoes_visibility",
  service.toggleBatchActiveStatus
);

export default BatchPublicRoutes;
