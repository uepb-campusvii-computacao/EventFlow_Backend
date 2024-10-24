import { Perfil, TipoAtividade } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import ActivityRepository from "../repositories/ActivityRepository";
import EventRepository from "../repositories/EventRepository";
import LoteRepository from "../repositories/LoteRepository";
import OrderRepository from "../repositories/OrderRepository";
import ProductRepository from "../repositories/ProductRepository";
import UserEventRepository from "../repositories/UserEventRepository";
import UserInscricaoRepository from "../repositories/UserInscricaoRepository";
import { getPayment } from "../services/payments/getPayment";

export default class EventController {
  static async registerParticipanteInEvent(req: Request, res: Response) {
    try {
      const registerUserInEventSchema = z.object({
        atividades: z
          .array(
            z.object({
              atividade_id: z.string(),
            })
          )
          .optional(),
      });

      const { atividades } = registerUserInEventSchema.parse(req.body);

      const { lote_id } = req.params;

      const uuid_user = res.locals.id;

      const perfil: Perfil = "PARTICIPANTE";

      await UserEventRepository.registerUserInEvent({
        uuid_user,
        lote_id,
        perfil,
        atividades,
      });

      return res
        .status(200)
        .json({ message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json(formattedErrors);
      }

      if (error instanceof Error) {
        return res.status(400).send(error.message);
      } else {
        return res.status(400).json(error);
      }
    }
  }

  static async getEventInformation(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      const response = await EventRepository.findEventById(event_id);

      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async toggleLoteAtivo(req: Request, res: Response) {
    try {
      const { lote_id } = req.params;

      await LoteRepository.toggleLoteAtivo(lote_id);

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

  static async getAllLotesInEvent(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      const lotes_in_event = await LoteRepository.getAllLotesByEventID(
        event_id
      );

      return res.status(200).json(lotes_in_event);
    } catch (error) {
      return res.status(400).send("informações inválidas");
    }
  }

  static async getLotesAtivosInEvent(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      const lotes_in_event = await LoteRepository.getLotesAtivosByEventID(
        event_id
      );

      return res.status(200).json(lotes_in_event);
    } catch (error) {
      return res.status(400).send("informações inválidas");
    }
  }

  static async updateParticipantInformations(req: Request, res: Response) {
    try {
      const { user_id } = req.params;

      const {
        nome,
        nome_cracha,
        email,
        instituicao,
        status_pagamento,
        minicurso,
        workshop,
        oficina,
      } = req.body;

      console.log(req.body);

      const activities: { id: string; type: TipoAtividade }[] = [];

      if (minicurso) {
        activities.push({ id: minicurso, type: "MINICURSO" });
      }

      if (workshop) {
        activities.push({ id: workshop, type: "WORKSHOP" });
      }

      if (oficina) {
        activities.push({ id: oficina, type: "OFICINA" });
      }

      const updatedUser = await UserInscricaoRepository.updateParticipante(
        user_id,
        nome,
        nome_cracha,
        email,
        instituicao,
        status_pagamento,
        activities
      );

      return res.status(200).json({
        message: "Dados alterados com sucesso!",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Erro ao atualizar informações do usuário:", error);

      let errorMessage = "Erro ao atualizar dados do usuário.";
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          errorMessage = "Este e-mail já está em uso.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return res.status(400).json({ message: errorMessage });
    }
  }

  static async getAllEvents(req: Request, res: Response) {
    try {
      const all_events = await EventRepository.findAllEvents();

      return res.status(200).json(all_events);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async getAllProductsInEvent(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      const response = await ProductRepository.findAllProductsByEventId(
        event_id
      );

      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async getAllEventsByIdUser(req: Request, res: Response) {
    try {
      const user_id = res.locals.id;

      const eventos = await UserInscricaoRepository.findAllEventsByUserId(
        user_id
      );

      return res.status(200).json(eventos);
    } catch (error) {
      return res.status(400).send("Informação incorreta");
    }
  }

  static async getAllSubscribersInEvent(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      const all_subscribers =
        await UserInscricaoRepository.projectionTableCredenciamento(event_id);

      if (!all_subscribers) {
        return res.status(400).send("Evento não encontrado");
      }

      return res.status(200).json({ all_subscribers });
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  }

  static async getAllFinancialInformationsInEvent(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      const all_subscribers =
        await UserInscricaoRepository.findAllSubscribersInEvent(event_id);

      if (!all_subscribers) {
        return res.status(400).send("Evento não encontrado");
      }

      const response = await Promise.all(
        all_subscribers.map(async (item) => {
          let transaction_data = null;
          if (item.id_payment_mercado_pago) {
            try {
              transaction_data = await getPayment(item.id_payment_mercado_pago);
            } catch (error) {
              console.error("Erro ao obter dados do pagamento:", error);
            }
          }

          return {
            uuid_user: item.uuid_user,
            nome: item.usuario.nome,
            email: item.usuario.email,
            mercado_pago_id: item.id_payment_mercado_pago,
            status_pagamento: item.status_pagamento,
            status: transaction_data ? transaction_data.status : "",
            date_created: transaction_data ? transaction_data.date_created : "",
            data_approved: transaction_data
              ? transaction_data.date_approved
              : "",
          };
        })
      );

      return res.status(200).json(response);
    } catch (error) {
      console.error("Erro na solicitação:", error);
      return res
        .status(500)
        .send("Ocorreu um erro ao processar a solicitação.");
    }
  }

  static async changeEventCredenciamentoValue(req: Request, res: Response) {
    try {
      const { event_id, user_id } = req.params;

      const user_inscricao =
        await UserInscricaoRepository.findUserInscricaoByEventId(
          user_id,
          event_id
        );

      await UserInscricaoRepository.changeCredenciamentoValue(
        user_id,
        user_inscricao!.uuid_lote,
        !user_inscricao?.credenciamento
      );

      return res.status(200).send("Valor Alterado com sucesso!");
    } catch (error) {
      console.log(error);
      return res.status(400).send("Informações inválidas");
    }
  }

  static async getAllActivitiesInEvent(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      const all_activities = await EventRepository.findAllActivitiesInEvent(
        event_id
      );

      if (!all_activities) {
        return res.status(400).send("Evento não encontrado");
      }

      return res.status(200).json(all_activities.atividade);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async getAllActivitiesInEventOrdenateByTipo(
    req: Request,
    res: Response
  ) {
    try {
      const { id_evento } = req.params;

      const minicursos = await ActivityRepository.findActivitiesInEvent(
        id_evento,
        "MINICURSO"
      );
      const oficinas = await ActivityRepository.findActivitiesInEvent(
        id_evento,
        "OFICINA"
      );
      const workshops = await ActivityRepository.findActivitiesInEvent(
        id_evento,
        "WORKSHOP"
      );

      return res.status(200).json({
        minicursos,
        oficinas,
        workshops,
      });
    } catch (error) {
      return res.status(400).send("Informações invalidas!");
    }
  }

  static async getFinancialInformation(req: Request, res: Response) {
    try {
      const { event_id } = req.params;

      const [userInscriptions, totalArrecadadoVendas, credenciados] =
        await Promise.all([
          UserInscricaoRepository.findUserInscriptionStatus(event_id),
          OrderRepository.getTotalValueVendasByEvento(event_id),
          EventRepository.countUsuariosCredenciadosByEvento(event_id),
        ]);

      const usersRegistered = userInscriptions.length;
      const usersWithPaymentStatusPending = userInscriptions.filter(
        (inscricao) => inscricao.status_pagamento === "PENDENTE"
      ).length;

      const usersWithPaymentStatusGratuito = userInscriptions.filter(
        (inscricao) => inscricao.status_pagamento === "GRATUITO"
      ).length;

      const usersWithPaymentStatusRealizado = userInscriptions.filter(
        (inscricao) => inscricao.status_pagamento === "REALIZADO"
      );

      const totalArrecadadoInscricoes = usersWithPaymentStatusRealizado.reduce(
        (total, curr) => total + curr.lote.preco,
        0
      );

      return res.status(200).json({
        total_inscritos: usersRegistered,
        total_credenciados: credenciados,
        total_arrecadado: { totalArrecadadoInscricoes, totalArrecadadoVendas },
        inscricoes_pendentes: usersWithPaymentStatusPending,
        inscricoes_gratuitas: usersWithPaymentStatusGratuito,
      });
    } catch (error) {
      console.error("Erro ao obter informações financeiras:", error);
      return res
        .status(500)
        .json({ error: "Erro ao obter informações financeiras" });
    }
  }

  static async createEvent(req: Request, res: Response) {
    try {
      const uuid_user = res.locals.id;

      const createEventParams = z
        .object({
          nome: z.string(),
          banner_img_url: z.string().optional(),
          data: z.preprocess((arg) => {
            if (typeof arg === "string" || arg instanceof Date)
              return new Date(arg);
          }, z.date().optional()),
          conteudo: z.string(),
        })
        .parse(req.body);

      const event = await EventRepository.createEvent({
        uuid_user_owner: uuid_user,
        ...createEventParams,
      });

      return res.status(200).json(event);
    } catch (error) {
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
