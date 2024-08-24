export interface RegisterParticipanteParams {
    nome: string;
    nome_cracha: string;
    email: string;
    instituicao: string;
    atividades?: {
      minicurso_id?: string;
      workshop_id?: string;
      oficina_id?: string;
    };
    lote_id: string;
  }