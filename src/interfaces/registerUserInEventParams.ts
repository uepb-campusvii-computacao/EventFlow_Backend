import { Perfil } from "@prisma/client";

export interface RegisterUserInEventParams {
  user_id: string;
  event_id: string;
  perfil?: Perfil;
}
