import { TipoAtividade } from "@prisma/client";
import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";
export const createActivitySchema = z
  .object({
    eventId: z.string().openapi({
      example: "event-12345",
    }),
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
      example: TipoAtividade.PALESTRA,
    }),
  })
  .openapi({
    ref: "CreateActivityDto",
  });

export type CreateActivityDto = z.infer<typeof createActivitySchema>;

export const { components } = createSchema(createActivitySchema);
