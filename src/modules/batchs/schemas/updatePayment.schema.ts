import { z } from "zod";
import { createSchema } from "zod-openapi";
import "zod-openapi/extend";

export const updatePaymentStatusDto = z
  .object({
    id: z.string().optional().openapi({
      example: "1234",
    }),
    live_mode: z.boolean().optional().openapi({ example: true }),
    type: z.string().optional().openapi({ example: "payment" }),
    date_created: z
      .date()
      .optional()
      .openapi({ example: "2015-03-25T10:04:58.396-04:00" }),
    action: z.string().openapi({ example: "payment.updated" }),
  })
  .openapi({
    ref: "UpdatePaymentStatusDto",
  });

export const { components } = createSchema(updatePaymentStatusDto);
