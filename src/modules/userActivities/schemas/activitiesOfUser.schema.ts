import { TipoAtividade } from "@prisma/client";
import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";

export const activitiesOfUserSchema = z
  .array(
    z.object({
      isPresent: z.boolean(),
      name: z.string(),
      activityId: z.string().uuid(),
      activityType: z.nativeEnum(TipoAtividade),
    })
  )
  .openapi({
    ref: "ActivitiesOfUserDto",
    example: [
      {
        activityId: "123e4567-e89b-12d3-a456-426614174000",
        isPresent: false,
        activityType: "MINICURSO",
        name: "Introdução a Machine Learning",
      },
      {
        activityId: "4437bfss-e89b-12d3-aggg-426dfgd4174000",
        isPresent: true,
        activityType: "OFICINA",
        name: "Introdução a ReactJs",
      },
    ],
  });

export type ActivitiesOfUserDto = z.infer<typeof activitiesOfUserSchema>;

export const { components } = createSchema(activitiesOfUserSchema);
