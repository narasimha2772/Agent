import { createClient } from "redis";
let client: ReturnType<typeof createClient> | null = null;
export async function getRedis() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    client.on("error", (e) => console.error("redis error", e));
    await client.connect();
  }
  return client;
}

