import { Perfil } from "@prisma/client";
import { z } from "zod";
import { registerUserLoggedInActivitiesSchema } from "../../userActivities/schemas/register.schema";

export const registerUserInEventSchema = z
  .object({
    userId: z.string(),
    perfil: z.nativeEnum(Perfil).optional(),
    batchId: z.string(),
  })
  .merge(registerUserLoggedInActivitiesSchema)
  .partial({ activities: true });

export type RegisterUserInEventDto = z.infer<typeof registerUserInEventSchema>;
