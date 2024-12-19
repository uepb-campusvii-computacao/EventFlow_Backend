import { readdirSync } from "fs";
import { join } from "path";

function loadSchemas() {
  const schemasDirectory = join(__dirname, '../modules/batchs/schemas/');
  const files = readdirSync(schemasDirectory);

  let allComponents = {};

  files.forEach((file) => {
    if (file.endsWith(".ts") && file !== "index.ts") {
      const schemaModule = require(join(schemasDirectory, file));

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
