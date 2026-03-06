import { createClient } from "redis";
import dotenv from "dotenv"
import { logActivity } from "../utils/logging.utils";
dotenv.config();

const client = createClient({
    url: process.env.REDIS_URL || ""
});

client.on("error", (err) => {
    console.log(err);
});

await client.connect();

const pubClient = client.duplicate();
const subClient = client.duplicate();

logActivity.log("Redis connected");

export { client, pubClient, subClient }