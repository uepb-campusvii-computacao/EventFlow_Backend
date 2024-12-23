import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";

export const changeUserActivitiesSchema = z
  .object({
    currentActivityId: z.string().uuid().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    newActivityId: z.string().uuid().openapi({
      example: "13982fna-dddd-12d3-a456-0qtfajsdfas0",
    }),
  })
  .openapi({
    ref: "ChangeUserActivitiesDto",
  });

export type ChangeUserActivitiesDto = z.infer<typeof changeUserActivitiesSchema>;

export const { components } = createSchema(changeUserActivitiesSchema);
