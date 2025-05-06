import { QueueOptions } from "bullmq";

export const bullMQConnection: QueueOptions = {
    connection: {
        host: "localhost",
        port: 6379,
        password: undefined,
        db: 0,
    }
};

export default bullMQConnection;