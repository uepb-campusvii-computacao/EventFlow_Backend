import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./docs/swagger";
import router from "./routes";
dotenv.config();

const app = express();

app.use(express.json());

const FRONTEND_URL = process.env.FRONTEND_URL || "";
const GERENCIADOR_URL = process.env.GERENCIADOR_URL || "";

app.use(
  cors({
    origin: [FRONTEND_URL, GERENCIADOR_URL],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//app.use(routes);
app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Http server running! on port " + PORT));
