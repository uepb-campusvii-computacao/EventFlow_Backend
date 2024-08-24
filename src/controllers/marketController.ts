import { Request, Response } from "express";
import { UpdateProductParams } from "../interfaces/updateProductParams";
import ProductRepository from "../repositories/ProductRepository";

export async function updateProductInMarket(req: Request, res: Response) {
  try {
    const { produto_id } = req.params;
    const { nome, descricao, estoque, preco, imagem_url }: UpdateProductParams =
      req.body;

    const produto = await ProductRepository.updateProduct(
      produto_id,
      nome,
      descricao,
      Number(estoque),
      Number(preco),
      imagem_url
    );

    return res.status(200).json(produto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
    return res.status(400).send(error);
  }
}

export async function getProductInMarket(req: Request, res: Response) {
  try {
    const { produto_id } = req.params;

    const produto = await ProductRepository.findProductById(produto_id);

    return res.status(200).json(produto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
    return res.status(400).send(error);
  }
}

export async function getUsersWithOrders(req: Request, res: Response) {
  try {
    const { produto_id } = req.params;

    const usuarios = await ProductRepository.findUsersByProductId(produto_id);

    return res.status(200).json(usuarios);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).send(error.message);
    }
    return res.status(400).send(error);
  }
}