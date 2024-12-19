import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";

export const registerUserInEventSchema = z
  .object({
    atividades: z
      .array(
        z.object({
          atividade_id: z.string().uuid(),
        })
      )
      .min(1, {
        message: "O campo 'atividades' deve conter pelo menos uma atividade.",
      }),
  })
  .openapi({
    ref: "RegisterUserInEvent",
    description:
      "Schema for registering a user in an event with selected activities.",
    example: {
      atividades: [
        {
          atividade_id: "123e4567-e89b-12d3-a456-426614174000",
        },
      ],
    },
  });

export const { components } = createSchema(registerUserInEventSchema);


