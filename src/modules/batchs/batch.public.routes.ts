import express from "express";
import UserController from "../../controllers/UserController";

const BatchPublicRoutes = express.Router();

BatchPublicRoutes.get(
  "/lote/:lote_id/inscricoes/user/:user_id/",
  UserController.getUserInformation
);

/**
 * @openapi
 * /lote/:lote_id/user/:user_id/realizar-pagamento:
 *   post:
 *     tags:
 *        - Batchs
 *     summary: Update notification without payment.
 *     parameters:
 *       - name: lote_id
 *         in: path
 *         description: Batch ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: user_id
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePaymentStatusDto'
 *
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Valor alterado!"
 *
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Informações inválidas"
 *
 *
 */
BatchPublicRoutes.post(
  "/lote/:lote_id/user/:user_id/realizar-pagamento",
  UserController.realizarPagamento
);

export default BatchPublicRoutes;
