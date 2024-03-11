import { Redis } from "ioredis";
require("dotenv").config();

// Mengambil URL Redis dari variabel lingkungan
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("Redis connection failed: REDIS_URL is not defined in the environment variables");
}

// Membuat instance Redis
export const redis = new Redis(redisUrl);

console.log(`Redis connected to ${redisUrl}`);