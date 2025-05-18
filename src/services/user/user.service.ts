import { randomUUID } from "crypto";
import UserInscricaoRepository from "../../repositories/UserInscricaoRepository";
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

  public static async getAllUsersInEvent(eventId: string) {
    try {
      const users = await UserInscricaoRepository.getAllUsersInEvent(eventId);

      if (!users) {
        throw new Error("Users not found");
      }

      return users;
    } catch (error) {}
  }
}
