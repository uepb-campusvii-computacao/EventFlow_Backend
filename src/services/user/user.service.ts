import { randomUUID } from "crypto";
import UserRepository from "../../repositories/UserRepository";
import { encryptPassword } from "./encryptPassword";

export class UserService {
  public static async registerGuest({
    name,
    cpf,
    email,
    organization,
    nickname,
  }: {
    name: string;
    cpf: string;
    email: string;
    organization: string;
    nickname: string;
  }) {
    const user = await UserRepository.createUser({
      nome: name,
      cpf: cpf,
      email: email,
      instituicao: organization,
      nome_cracha: nickname,
      senha: await encryptPassword(randomUUID()),
    });

    const { senha, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  public static async getProfile(userId: string) {
    const user = await UserRepository.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const { nome, nome_cracha, email, instituicao, cpf, active } = user;

    const userCpf = cpf.replace(/^(\d{3}).*\D(\d{2})$/, (middle) => {
      return `***${middle}**`;
    });

    return { nome, nome_cracha, email, instituicao, cpf: userCpf, active };
  }
}
