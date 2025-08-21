import { Request, Response, NextFunction } from "express";
import { getRedis } from "./redis.js";

export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/acp/health") return next();
  const key = (req.header("Idempotency-Key") || (req.body && req.body.id)) as string | undefined;
  if (!key) return next();
  const redis = await getRedis();
  const exists = await redis.get(`idem:${key}`);
  if (exists) return res.status(200).json({ ok: true, idempotent: true });
  await redis.setEx(`idem:${key}`, 3600, "1");
  next();
}

