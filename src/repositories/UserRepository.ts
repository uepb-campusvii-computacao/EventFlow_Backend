import { RegisterParticipanteParams } from "../interfaces/registerParticipanteParams";
import { prisma } from "../plugins/prisma";

export default class UserRepository {
  static async createUser(
    {
      nome,
      nome_cracha,
      senha,
      email,
      instituicao,
    }: {
      nome: string;
      senha: string;
      nome_cracha: string;
      email: string;
      instituicao: string;
    }
  ) {
    const existingUser = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error(
        "Este e-mail já está cadastrado. Por favor, use outro e-mail."
      );
    }

    return await prisma.usuario.create({
      data: {
        nome,
        senha,
        nome_cracha,
        email,
        instituicao,
      },
    });
  }

  static async isUserRegisteredInLote(
    tx: typeof prisma,
    user_uuid: string,
    lote_id: string
  ): Promise<boolean> {
    const registro = await tx.userInscricao.findFirst({
      where: {
        uuid_user: user_uuid,
        uuid_lote: lote_id,
      },
    });

    return Boolean(registro);
  }

  static async registerUserInActivities(
    tx: typeof prisma,
    user_uuid: string,
    atividades: RegisterParticipanteParams["atividades"]
  ) {
    //Esses tipos de id pra minicurso, workshop e oficina não existem
    const activities_ids = [
      atividades?.minicurso_id,
      atividades?.workshop_id,
      atividades?.oficina_id,
    ];

    for (const uuid_atividade of activities_ids) {
      if (uuid_atividade) {
        const activity = await tx.atividade.findUnique({
          where: {
            uuid_atividade,
          },
        });

        if (!activity) {
          throw new Error("Atividade não encontrada");
        }

        const count = await tx.userAtividade.count({
          where: {
            uuid_atividade,
          },
        });

        if (activity.max_participants && count >= activity.max_participants) {
          throw new Error(`A atividade ${activity.nome} está cheia`);
        }

        await tx.userAtividade.create({
          data: {
            uuid_user: user_uuid,
            uuid_atividade,
          },
        });
      }
    }
  }

  static async findUserByEmail(email: string) {
    const user = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  static async updateUser(
    uuid_user: string,
    nome: string,
    email: string,
    nome_cracha: string,
    instituicao: string
  ) {
    const user_exists = await this.findUserByEmail(email);

    if (user_exists && user_exists.uuid_user != uuid_user) {
      throw new Error("Email já cadastrado!");
    }

    const user = await prisma.usuario.update({
      where: {
        uuid_user,
      },
      data: {
        nome,
        nome_cracha,
        email,
        instituicao,
      },
    });

    return user;
  }

  static async updateUserRecoverInfo(email : string, passwordResetToken : string, passwordResetExpires : Date){
    return await prisma.usuario.update({
      where: { email },
      data: {
          passwordResetToken,
          passwordResetExpires
      }
    });
  };

  static async updateUserPassword(email : string, password : string){
    return await prisma.usuario.update({
      where: { email },
      data: {
          passwordResetToken : null,
          passwordResetExpires: null,
          senha: password
      }
    });
  };
  
  static async findUserByToken(token: string) {
    const users = await prisma.usuario.findMany({
        where: {
            passwordResetToken: token,
            passwordResetExpires: {
                gte: new Date(),
            },
        },
    });
    return users.length > 0 ? users[0] : null;
  }


  static async findUserById(uuid_user: string) {
    const user = await prisma.usuario.findUniqueOrThrow({
      where: {
        uuid_user,
      },
    });

    return user;
  }
}
