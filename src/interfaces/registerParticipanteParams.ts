import { Perfil } from "@prisma/client";

export interface RegisterParticipanteParams {
  nome: string;
  uuid_user: string;
  nome_cracha: string;
  email: string;
  perfil: Perfil;
  instituicao: string;
  atividades?: string[];
  lote_id: string;
}
