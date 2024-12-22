import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";

export const subscribersInActivitySchema = z
  .array(
    z.object({
      userId: z.string(),
      isPresent: z.boolean(),
      nome: z.string(),
      nome_cracha: z.string(),
      email: z.string().email(),
    })
  )
  .openapi({
    ref: "SubscribersInActivityDto",
    example: [
      {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        isPresent: true,
        nome: "João Silva",
        nome_cracha: "João",
        email: "joao.silva@example.com",
      },
      {
        userId: "987e6543-e21b-32d1-c654-426614174001",
        isPresent: false,
        nome: "Maria Oliveira",
        nome_cracha: "Maria",
        email: "maria.oliveira@example.com",
      },
    ],
  });

export type SubscribersInActivityDto = z.infer<
  typeof subscribersInActivitySchema
>;

export const { components } = createSchema(subscribersInActivitySchema);
