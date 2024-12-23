import express from "express";
import ActivityController from "../../controllers/ActivityController";
import { checkToken } from "../../middlewares/ensureAuthenticate";

const ActivityPrivateRoutes = express.Router();

ActivityPrivateRoutes.use(checkToken);

/**
 * @openapi
 * /atividades/:atividade_id/inscricoes:
 *   get:
 *     tags:
 *        - Activities
 *     summary: Get all users registered in the activity.
 *     parameters:
 *       - name: atividade_id
 *         in: path
 *         description: Activity ID
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
 *               $ref: '#/components/schemas/SubscribersInActivityDto'
 *
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Atividade não encontrada"
 *
 *
 */
ActivityPrivateRoutes.get(
  "/atividades/:atividade_id/inscricoes",
  ActivityController.getSubscribersInActivity
);

/**
 * @openapi
 * /atividades/:atividade_id/:
 *   get:
 *     tags:
 *        - Activities
 *     summary: Get activity by Id
 *     parameters:
 *       - name: atividade_id
 *         in: path
 *         description: Activity ID
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
 *               $ref: '#/components/schemas/ActivityDto'
 *
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Atividade não encontrada"
 *
 *
 */
ActivityPrivateRoutes.get(
  "/atividades/:atividade_id",
  ActivityController.getActivityById
);

/**
 * @openapi
 * /atividades/:atividade_id/:
 *   put:
 *     tags:
 *        - Activities
 *     summary: Update activity data.
 *     parameters:
 *       - name: atividade_id
 *         in: path
 *         description: Activity ID
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateActivityDto'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityDto'
 *
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Falha ao atualizar atividade"
 *
 *
 */
ActivityPrivateRoutes.put(
  "/atividades/:atividade_id",
  ActivityController.updateActivity
);

/**
 * @openapi
 * /atividades/:atividade_id/inscricoes/:user_id/frequencia:
 *   put:
 *     tags:
 *       - Activities
 *     summary: Update user frequency in activity
 *     parameters:
 *       - name: atividade_id
 *         in: path
 *         description: Activity ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: user_id
 *         in: path
 *         description: User ID whose frequency will be changed
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Valor alterado com sucesso!"
 *       400:
 *         description: Error message
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Atividade não encontrada"
 */
ActivityPrivateRoutes.put(
  "/atividades/:atividade_id/inscricoes/:user_id/frequencia",
  ActivityController.changeActivityPresencaValue
);

/**
 * @openapi
 * /user/:user_id/atividades/troca:
 *   put:
 *     tags:
 *       - Activities
 *     summary: Change user activities
 *     parameters:
 *       - name: user_id
 *         in: path
 *         description: User ID whose frequency will be changed
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeUserActivitiesDto'
 *     responses:
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Valor alterado com sucesso!"
 *       400:
 *         description: Error message
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Erro"
 */
ActivityPrivateRoutes.put(
  "/user/:user_id/atividades/troca",
  ActivityController.upadateUserActivity
);

export default ActivityPrivateRoutes;
