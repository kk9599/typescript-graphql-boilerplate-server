import { Redis } from "ioredis";

export default async (id: string, redis: Redis) => {
  return redis.del(id);
};
