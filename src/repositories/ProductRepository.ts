import { prisma } from "../plugins/prisma";

export default class ProductRepository {
  static async findAllProductsByEventId(uuid_evento: string) {
    const events = await prisma.produto.findMany({
      where: {
        uuid_evento,
      },
    });

    return events;
  }

  static async updateProduct(
    uuid_produto: string,
    nome: string,
    descricao: string,
    estoque: number,
    preco: number,
    imagem_url: string
  ) {
    const produto = await prisma.produto.update({
      where: {
        uuid_produto,
      },
      data: {
        descricao,
        estoque,
        nome,
        preco,
        imagem_url,
      },
    });

    return produto;
  }

  static async findUsersByProductId(uuid_produto: string) {
    const users = await prisma.venda.findMany({
      where: {
        uuid_produto,
      },
      select: {
        user: {
          select: {
            uuid_user: true,
            nome: true,
            email: true,
          },
        },
      },
      distinct: ["uuid_user"],
    });

    return users.map((item) => ({ ...item.user }));
  }

  static async findProductById(uuid_produto: string) {
    const produto = await prisma.produto.findUniqueOrThrow({
      where: {
        uuid_produto,
      },
    });

    return produto;
  }
}
