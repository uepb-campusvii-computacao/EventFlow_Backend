import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";

export const registerUserLoggedInActivitiesSchema = z
  .object({
    activities: z
      .array(
        z.object({
          activityId: z.string().uuid(),
        })
      )
      .min(1, {
        message: "O campo 'atividades' deve conter pelo menos uma atividade.",
      }),
  })
  .openapi({
    ref: "RegisterUserLoggedInActivitiesDto",
    description:
      "Schema for registering a user in an event with selected activities.",
    example: {
      activities: [
        {
          activityId: "123e4567-e89b-12d3-a456-426614174000",
        },
      ],
    },
  });

export type RegisterUserLoggedInActivitiesDto = z.infer<typeof registerUserLoggedInActivitiesSchema>;

export const { components } = createSchema(registerUserLoggedInActivitiesSchema);
