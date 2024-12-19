import { MercadoPagoConfig, Payment } from "mercadopago";
import * as dotenv from 'dotenv';

dotenv.config();

const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN_MERCADOPAGO || "", options: { timeout: 5000 } });

export const payment = new Payment(client);