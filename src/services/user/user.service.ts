import { TipoAtividade, TurnoAtividade } from "@prisma/client";
import { randomUUID } from "crypto";
import slugify from "slugify";
import ActivityRepository from "../../repositories/ActivityRepository";
import UserAtividadeRepository from "../../repositories/UserAtividadeRepository";
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

    const { uuid_user, nome, nome_cracha, email, instituicao, cpf, active } =
      user;

    const cleanCpf = cpf.replace(/[^\d]/g, "");

    const userCpf = cleanCpf.replace(
      /^\d{3}(\d{3})(\d{3})\d{2}$/,
      "***.$1.$2-**"
    );

    return {
      id: uuid_user,
      nome,
      nome_cracha,
      email,
      instituicao,
      cpf: userCpf,
      active,
    };
  }

  public static async getUserEvents(userId: string) {
    const userEvents = await UserEventRepository.findAllUserEvents(userId);

    if (!userEvents) {
      throw new Error("User events not found");
    }

    const events = userEvents.map(({ uuid_evento, evento }) => {
      return {
        id: uuid_evento,
        slug: slugify(evento.nome, { lower: true, strict: true }),
        nome: evento.nome,
        data: evento.date,
        ativo: evento.active,
        banner: evento.banner_img_url,
      };
    });

    return events;
  }

  public static async getUserActivities(
    userId: string,
    nome?: string,
    tipo_atividade?: TipoAtividade[],
    turno?: TurnoAtividade[],
    presenca?: boolean,
    data_inicio?: Date,
    data_fim?: Date,
    evento?: string
  ) {
    const userActivities = await UserAtividadeRepository.findActivitiesByUserId(
      userId,
      {
        nome,
        turno,
        tipo_atividade,
        presenca,
        data_fim,
        data_inicio,
        evento,
      }
    );

    if (!userActivities) {
      throw new Error("User activities not found");
    }

    const activities = userActivities.map(
      ({
        nome,
        presenca,
        tipo_atividade,
        uuid_atividade,
        turno,
        date,
        descricao,
        evento,
      }) => {
        return {
          id: uuid_atividade,
          nome,
          evento: evento.nome,
          descricao,
          tipo_atividade,
          presenca,
          date,
          turno,
        };
      }
    );

    return activities;
  }

  public static async updateActivities(
    userId: string,
    oldActivities: { id: string; tipo: TipoAtividade; turno: TurnoAtividade }[],
    newActivities: { id: string; tipo: TipoAtividade; turno: TurnoAtividade }[]
  ) {
    try {
      const existingActivities = await Promise.all([
        ...newActivities.map((activity) => {
          return ActivityRepository.findActivityById(activity.id);
        }),
        ...oldActivities.map((activity) => {
          return ActivityRepository.findActivityById(activity.id);
        }),
      ]);

      if (!existingActivities) {
        throw new Error("Atividade não encontrada");
      }

      for (const newActivity of newActivities) {
        const existingActivity = existingActivities.find(
          (act) => act?.uuid_atividade === newActivity.id
        );

        if (existingActivity) {
          if (
            existingActivity.max_participants &&
            existingActivity._count >= existingActivity.max_participants
          ) {
            throw new Error(
              `A atividade "${existingActivity.nome}" atingiu o número máximo de inscritos.`
            );
          }
        }
      }

      const checkForDuplicates = (
        activities: { tipo: TipoAtividade; turno: TurnoAtividade }[]
      ) => {
        const seen = new Set<string>();
        activities.forEach((activity) => {
          const key = `${activity.tipo}-${activity.turno}`;
          if (seen.has(key)) {
            return true;
          }
          seen.add(key);
        });
        return false;
      };

      if (checkForDuplicates(oldActivities)) {
        throw new Error(
          "Existem atividades duplicadas (mesmo tipo e turno) na lista de atividades antigas."
        );
      }

      if (checkForDuplicates(newActivities)) {
        throw new Error(
          "Existem atividades duplicadas (mesmo tipo e turno) na lista de atividades novas."
        );
      }

      const oldActivitiesIds = oldActivities.map((activity) => activity.id);
      const newActivitiesIds = newActivities.map((activity) => activity.id);

      const activitiesToRemove = oldActivitiesIds.filter(
        (id) => !newActivitiesIds.includes(id)
      );
      const activitiesToAdd = newActivitiesIds.filter(
        (id) => !oldActivitiesIds.includes(id)
      );

      await Promise.all([
        ...activitiesToRemove.map((activityId) =>
          UserAtividadeRepository.deleteUserAtividade(userId, activityId)
        ),
        ...activitiesToAdd.map((activityId) =>
          UserAtividadeRepository.createUserAtividade(userId, activityId)
        ),
      ]);

      console.log("Activities added:", activitiesToAdd);
      console.log("Activities removed:", activitiesToRemove);

      const updatedActivites =
        await UserAtividadeRepository.findActivitiesByUserId(userId, {});

      return updatedActivites;
    } catch (error) {
      console.error("Error updating activities:", error);
      throw error;
    }
  }
}
