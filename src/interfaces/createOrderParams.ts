export interface CreateOrderParams{
    email: string;
    produtos: {
        uuid_produto: string;
        quantidade: number;
    }[]
}