import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import bodyParser from "body-parser";
import { validateHmac } from "./lib/hmac.js";
import { idempotencyMiddleware } from "./lib/idempotency.js";
import { initWsServer } from "./lib/ws.js";
import { logger, withReqLog } from "./lib/logger.js";
import { handleSend, handleBroadcast, handleInbox, handleAgents, handleHealth, handleApprove, handleEscalate } from "./routes/acp.js";

const app = express();
app.use(cors());
app.use(bodyParser.json({
  limit: "2mb",
  verify: (req: any, _res: Response, buf: Buffer) => { req.rawBody = buf?.toString() || ""; }
}));
app.use(withReqLog);
app.use(idempotencyMiddleware);
app.use(validateHmac);

app.post("/acp/send", handleSend);
app.post("/acp/broadcast", handleBroadcast);
app.get("/acp/agents", handleAgents);
app.get("/acp/inbox", handleInbox);
app.get("/acp/health", handleHealth);
app.post("/acp/approve", handleApprove);
app.post("/acp/escalate", handleEscalate);

const server = app.listen(process.env.PORT || 3000, () => {
  logger.info({ port: process.env.PORT || 3000 }, "Master API listening");
});
initWsServer(server);

