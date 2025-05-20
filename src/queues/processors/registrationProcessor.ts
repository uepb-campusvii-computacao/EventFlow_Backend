import { Job, Worker } from "bullmq";
import { bullMQConnection } from "../../utils/redisConnection";
import LoteRepository from "../../repositories/LoteRepository";
import UserEventRepository from "../../repositories/UserEventRepository";

const registrationWorker = new Worker(
  "registrationQueue",
  async (job : Job) => {
    const { uuid_user, lote_id, perfil, atividades, paymentInfo } = job.data;

    const lote = await LoteRepository.findLoteById(lote_id);
    if (!lote || lote.inscricoes >= lote.max_inscricoes) {
      throw new Error("Lote cheio ou não encontrado.");
    }
      await UserEventRepository.registerUserInEvent({
        uuid_user,
        lote_id,
        perfil,
        atividades,
        paymentInfo
      });

    console.log(`Inscrição pendente criada para o usuário ${uuid_user} no lote ${lote_id}.`);
  }, bullMQConnection
);

registrationWorker.on("completed", (job) => {
  console.log(`Job ${job.id} concluído com sucesso.`);
});

registrationWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} falhou:`, err);
});