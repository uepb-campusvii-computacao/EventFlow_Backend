import swaggerJSDoc from "swagger-jsdoc";
import { createDocument } from "zod-openapi";
import { allSchemas } from "../middlewares/swagger.components";

export const openAPIDocument = createDocument({
  openapi: "3.0.0",
  info: {
    title: "API Documentation",
    version: "1.0.0",
    description: "API documentation with Zod schemas",
  },
  components: {
    schemas: allSchemas,
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
});

const swaggerOptions = {
  definition: {
    ...openAPIDocument,
  },
  apis: ["src/modules/**/*.ts"],
};

export const swaggerDocs = swaggerJSDoc(swaggerOptions);
