import { randomUUID } from "crypto";
import UserEventRepository from "../../repositories/UserEventRepository";
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

    const cleanCpf = cpf.replace(/[^\d]/g, "");

    const userCpf = cleanCpf.replace(
      /^\d{3}(\d{3})(\d{3})\d{2}$/,
      "***.$1.$2-**"
    );

    return { nome, nome_cracha, email, instituicao, cpf: userCpf, active };
  }

  public static async getUserEvents(userId: string) {
    const userEvents = await UserEventRepository.findAllUserEvents(userId);

    if (!userEvents) {
      throw new Error("User events not found");
    }

    const events = userEvents.map(({ uuid_evento, evento }) => {
      return {
        id: uuid_evento,
        nome: evento.nome,
        data: evento.date,
        ativo: evento.active,
        banner: evento.banner_img_url,
      };
    });

    return events;
  }
}
