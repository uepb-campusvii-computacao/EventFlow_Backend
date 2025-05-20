import { QueueOptions } from "bullmq";
import { config } from "dotenv";

export const bullMQConnection: QueueOptions = {
    connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || "",
        db: Number(process.env.REDIS_DB) || 0,
    }
};

export default bullMQConnection;