import { TipoAtividade } from "@prisma/client";

export interface UpdateActivityParams{
    nome: string;
    descricao: string;
    tipo_atividade: TipoAtividade;
    max_participants: number;
}