import { Queue } from "bullmq";
import { bullMQConnection } from "../utils/redisConnection";

export const registrationQueue = new Queue("registrationQueue", bullMQConnection);