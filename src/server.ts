import express from "express";
import cors from "cors"
import * as dotenv from 'dotenv';
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import SwaggerDocs from "../src/swagger.json";
import { checkToken } from "./lib/ensureAuthenticate";
dotenv.config();

const app = express();

app.use(express.json());

app.use("/doc-api",checkToken, swaggerUi.serve, swaggerUi.setup(SwaggerDocs))

const FRONTEND_URL = process.env.FRONTEND_URL || ""
const GERENCIADOR_URL = process.env.GERENCIADOR_URL || ""


app.use(cors({
    origin: [FRONTEND_URL, GERENCIADOR_URL],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
}));

app.use(routes);

const PORT = process.env.PORT || 3000


app.listen(PORT, () => (
    console.log("Http server running! on port " + PORT)
));

