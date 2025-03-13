import { Request, Response } from "express";
import { z, ZodError } from "zod";
import LoteRepository from "../repositories/LoteRepository";

export class BatchController {
  public static async createBatch(req: Request, res: Response) {
    try {
      const createBatchSchema = z.object({
        nome: z.string(),
        descricao: z.string(),
        preco: z.number(),
        max_inscricoes: z.number(),
        ativo: z.boolean().optional(),
      });

      const { event_id } = req.params;
      const { nome, descricao, preco, max_inscricoes, ativo } =
        createBatchSchema.parse(req.body);

      const lote = LoteRepository.createBatch({
        nome,
        descricao,
        preco,
        max_inscricoes,
        ativo,
        uuid_evento: event_id,
      });

      if (!lote) {
        throw new Error("Erro ao criar lote");
      }

      return res.status(201).json(lote);
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json(formattedErrors);
      }

      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }

      return res
        .status(500)
        .json({ message: "An unexpected error occurred", error: error });
    }
  }
}
