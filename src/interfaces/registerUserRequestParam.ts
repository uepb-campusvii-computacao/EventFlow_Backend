import { AtividadesParams } from "./atividadeParams";

export interface RegisterUserRequestParams {
    nome: string;
    email: string;
    nome_cracha: string;
    instituicao: string;
    atividades?: AtividadesParams;
    lote_id: string;
};
