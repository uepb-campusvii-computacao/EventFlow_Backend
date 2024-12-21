import { TipoAtividade } from "@prisma/client";
import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";

export const activitySchema = z
  .object({
    id: z.string().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    eventId: z.string().openapi({
      example: "13982fna-dddd-12d3-a456-0qtfajsdfas0",
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
      example: TipoAtividade.WORKSHOP,
    }),
    numberOfRegistrations: z.number().openapi({
      example: 50,
    }),
  })
  .openapi({
    ref: "ActivityDto",
  });

export type ActivityDto = z.infer<typeof activitySchema>;

export const { components } = createSchema(activitySchema);
