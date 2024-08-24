export interface PaymentResponse{
    id?: number | undefined;
    date_created: string;
    date_of_expiration: string;
    description: string;
    payer: Payer;
    payment_method_id: string;
    point_of_interaction: PointOfInteraction,
};

interface Payer{
    id: string;
    email: string;
}

interface PointOfInteraction{
    transaction_data: TransactionData
}

interface TransactionData{
    qr_code_base64: string;
    qr_code: string;
    ticket_url: string;
}
