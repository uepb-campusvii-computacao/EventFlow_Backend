import { MercadoPagoConfig, Payment } from "mercadopago";

export const createPaymentClient = (accessToken: string) => {
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
    return new Payment(client);
};
