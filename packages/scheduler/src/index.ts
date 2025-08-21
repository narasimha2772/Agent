import cron from "node-cron";
import crypto from "crypto";
import fetch from "node-fetch";

const base = process.env.MASTER_API_BASE || "http://localhost:3000";
const secret = process.env.ACP_SHARED_SECRET || "dev-secret";
const tz = "Asia/Kolkata";

function sign(body: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("base64");
}

async function send(receiver: string, task: string, payload: any = {}, priority = "normal") {
  const body = {
    id: crypto.randomUUID(), ts: new Date().toISOString(), sender: "scheduler", receiver, task, priority, payload,
    expect: { schema: "any", deadline: new Date(Date.now() + 3600_000).toISOString() }, callbacks: {},
    mode: process.env.DEFAULT_PUBLISH_MODE || "preview", trace: { correlation_id: crypto.randomUUID(), parent_id: null }, signature: ""
  };
  const bodyStr = JSON.stringify(body);
  const sig = sign(bodyStr);
  await fetch(`${base}/acp/send`, { method: "POST", headers: { "Content-Type": "application/json", "X-ACP-Signature": sig, "Idempotency-Key": body.id, "X-ACP-Sender": "scheduler" }, body: bodyStr });
}

cron.schedule("0 0 6 * * *", () => { send("affiliate_blog_agent","daily_content"); send("niche_ads_blog_agent","daily_content"); send("ai_tools_directory_agent","daily_update"); }, { timezone: tz });
cron.schedule("0 0 8 * * *", () => { send("pod_agent","daily_batch"); send("stock_media_agent","curate"); }, { timezone: tz });
cron.schedule("0 0 10 * * *", () => send("newsletter_agent","compose_preview"), { timezone: tz });
cron.schedule("0 0 12 * * *", () => send("youtube_faceless_agent","compose_preview"), { timezone: tz });
cron.schedule("0 0 14 * * *", () => send("micro_saas_agent","ops"), { timezone: tz });
cron.schedule("0 0 16 * * *", () => { send("job_board_agent","sync"); send("ai_tools_directory_agent","refresh"); }, { timezone: tz });
cron.schedule("0 0 18 * * *", () => send("research_reports_agent","daily_report"), { timezone: tz });
cron.schedule("0 0 20 * * *", () => send("social_automation_agent","preview_batch"), { timezone: tz });
cron.schedule("0 0 22 * * *", () => send("arbitrage_agent","signals_only"), { timezone: tz });

console.log("Scheduler started with TZ", tz);

