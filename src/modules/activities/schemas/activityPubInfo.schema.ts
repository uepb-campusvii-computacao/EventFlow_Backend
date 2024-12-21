import { TipoAtividade } from "@prisma/client";
import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";

export const activityPubInfoSchema = z
  .object({
    date: z.date().nullable().openapi({
      example: "2024-12-25T15:00:00.000Z",
    }),
    name: z.string().openapi({
      example: "Introdução ao Machine Learning",
    }),
    description: z.string().nullable().openapi({
      example:
        "Uma palestra introdutória sobre conceitos básicos de Machine Learning.",
    }),
    maxParticipants: z.number().nullable().openapi({
      example: 100,
    }),
    activityType: z.nativeEnum(TipoAtividade).openapi({
      example: TipoAtividade.WORKSHOP,
    }),
    numberOfRegistrations: z.number().openapi({
      example: 50,
    }),
  })
  .openapi({
    ref: "ActivityPubInfoDto",
  });

export type ActivityPubInfoDto = z.infer<typeof activityPubInfoSchema>;

export const { components } = createSchema(activityPubInfoSchema);
