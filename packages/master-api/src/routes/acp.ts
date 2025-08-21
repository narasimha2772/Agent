import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getRedis } from "../lib/redis.js";
import { publishEvent } from "../lib/ws.js";

const inboxKey = (agent: string) => `inbox:${agent}`;
const idempotencyKey = (id: string) => `msg:${id}`;

export async function handleSend(req: Request, res: Response) {
  const body = req.body || {};
  const redis = await getRedis();
  const dupe = await redis.get(idempotencyKey(body.id));
  if (dupe) {
    return res.status(200).json({ ok: true, id: body.id, deduped: true });
  }
  await redis.rPush(inboxKey(body.receiver), JSON.stringify(body));
  await redis.setEx(idempotencyKey(body.id), 86400, "1");
  publishEvent("message_enqueued", { id: body.id, receiver: body.receiver, priority: body.priority });
  res.json({ ok: true, id: body.id });
}

export async function handleBroadcast(req: Request, res: Response) {
  const { task, payload, targets } = req.body || {};
  if (!task || !Array.isArray(targets)) return res.status(400).json({ error: "task and targets[] required" });
  const redis = await getRedis();
  const ids: string[] = [];
  for (const t of targets) {
    const msg = {
      id: uuid(), ts: new Date().toISOString(), sender: "master", receiver: t, task,
      priority: "normal", payload: payload || {}, expect: { schema: "any", deadline: new Date(Date.now() + 3600_000).toISOString() }, callbacks: {},
      mode: process.env.DEFAULT_PUBLISH_MODE || "preview", trace: { correlation_id: uuid(), parent_id: null }, signature: ""
    };
    await redis.rPush(inboxKey(t), JSON.stringify(msg));
    await redis.setEx(idempotencyKey(msg.id), 86400, "1");
    ids.push(msg.id);
    publishEvent("message_enqueued", { id: msg.id, receiver: t, priority: "normal" });
  }
  res.json({ ok: true, ids });
}

export async function handleInbox(req: Request, res: Response) {
  const agent = req.query.agent as string;
  const max = Number(req.query.max || 10);
  if (!agent) return res.status(400).json({ error: "agent required" });
  const redis = await getRedis();
  const msgs: string[] = [];
  for (let i = 0; i < max; i++) {
    const raw = await redis.lPop(inboxKey(agent));
    if (!raw) break;
    msgs.push(raw);
  }
  publishEvent("inbox_drained", { agent, count: msgs.length });
  res.json({ ok: true, messages: msgs.map((m) => JSON.parse(m)) });
}

export async function handleAgents(_: Request, res: Response) {
  const flags = Object.entries(process.env)
    .filter(([k]) => k.startsWith("ENABLE_"))
    .map(([k, v]) => ({ flag: k, enabled: v === "true" }));
  res.json({ ok: true, agents: flags });
}

export async function handleApprove(req: Request, res: Response) {
  const { itemId, decision, reason, riskLevel, amountUsd, businessRisk } = req.body || {};
  if (!itemId || !decision) return res.status(400).json({ error: "itemId and decision required" });
  publishEvent("approval_decision", { itemId, decision, reason, riskLevel, amountUsd, businessRisk });
  res.json({ ok: true });
}

export async function handleEscalate(req: Request, res: Response) {
  const { itemId, reason } = req.body || {};
  if (!itemId) return res.status(400).json({ error: "itemId required" });
  publishEvent("escalated", { itemId, reason });
  res.json({ ok: true });
}

export async function handleHealth(_: Request, res: Response) {
  res.json({ ok: true, ts: new Date().toISOString() });
}

