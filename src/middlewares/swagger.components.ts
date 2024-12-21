import fg from "fast-glob";
import { join } from "path";
import { ZodType, ZodTypeDef } from "zod";
import { ZodOpenApiObject } from "zod-openapi";

type Component = ZodType<any, ZodTypeDef, any> | ZodOpenApiObject;

function loadSchemas(): Record<string, Component> {
  const schemasDirectory = join(__dirname, "../modules/**/schemas/*.ts");
  const files = fg.sync(schemasDirectory);

  let allComponents: Record<string, Component> = {};

  files.forEach((file) => {
    if (!file.endsWith("index.ts")) {
      const schemaModule = require(file);

      if (schemaModule.components) {
        allComponents = {
          ...allComponents,
          ...schemaModule.components,
        };
      }
    }
  });

  return allComponents;
}

export const allSchemas = loadSchemas();
