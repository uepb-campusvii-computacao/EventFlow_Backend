import { Perfil } from "@prisma/client";

export interface RegisterUserInEventParams {
  user_id: string;
  lote_id: string;
  perfil?: Perfil;
}
