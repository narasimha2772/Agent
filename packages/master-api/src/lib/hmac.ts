import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export function signBody(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("base64");
}

export function validateHmac(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/acp/health") return next();
  const secret = process.env.ACP_SHARED_SECRET || "dev-secret";
  const sig = req.header("X-ACP-Signature") || "";
  const body = (req as any).rawBody || JSON.stringify(req.body || {});
  const expected = signBody(body, secret);
  if (sig !== expected) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  next();
}

