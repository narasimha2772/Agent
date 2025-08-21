import pino from "pino";
export const logger = pino({ level: process.env.LOG_LEVEL || "info" });
export function withReqLog(req: any, _res: any, next: any) {
  req.log = logger.child({ correlation_id: req.headers["x-correlation-id"] || req.body?.trace?.correlation_id });
  next();
}

