import { TipoAtividade } from "@prisma/client";
import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";

export const userActivityDetailsSchema = z
  .object({
    isPresent: z.boolean().openapi({ example: true }),
    name: z.string().openapi({ example: "Introdução a Machine Learning" }),
    activityId: z
      .string()
      .uuid()
      .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    activityType: z.nativeEnum(TipoAtividade).openapi({ example: "MINICURSO" }),
    date: z.date().nullable().openapi({ example: "2023-12-31" }),
  })
  .openapi({
    ref: "UserActivityDetailsDto",
  });

export type UserActivityDetailsDto = z.infer<typeof userActivityDetailsSchema>;

export const { components } = createSchema(userActivityDetailsSchema);
