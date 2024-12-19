import { Request, Response } from "express";
import BatchRepository from "./batch.repository";

export default class BatchService {
  public async toggleBatchActiveStatus(req: Request, res: Response) {
    try {
      const { lote_id } = req.params;

      await BatchRepository.toggleBatchActiveStatus(lote_id);

      return res.status(200).send("Campo ativo do lote alternado com sucesso!");
    } catch (error) {
      console.error("Erro ao alternar o campo ativo do lote:", error);

      let errorMessage = "Erro ao alternar o campo ativo do lote.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return res.status(400).json({ message: errorMessage });
    }
  }
}
