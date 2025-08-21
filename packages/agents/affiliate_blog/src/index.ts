import fs from "fs";
import path from "path";
import crypto from "crypto";
import fetch from "node-fetch";

async function main() {
  const keywords = ["best budget headphones 2025", "ergonomic office chairs under $200"];
  const contentDir = process.env.CONTENT_DIR || "/content";
  fs.mkdirSync(contentDir, { recursive: true });
  const writerUrl = process.env.WRITER_URL || "http://localhost:8011";
  let drafts: string[] = [];
  try {
    const r = await fetch(`${writerUrl}/writer/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keywords, mode: process.env.DEFAULT_PUBLISH_MODE || "preview" }) });
    if (r.ok) { const j = await r.json(); drafts = j.drafts || []; }
  } catch {
    drafts = keywords.map(k => `# ${k}\n\nPreview draft fallback.\n`);
  }
  const artifacts: string[] = [];
  keywords.forEach((kw, idx) => {
    const file = path.join(contentDir, `${kw.replace(/\s+/g, "-")}.md`);
    fs.writeFileSync(file, drafts[idx] || `# ${kw}\n\nPreview draft.\n`, "utf-8");
    artifacts.push(file);
  });
  console.log(JSON.stringify({ artifacts, correlationId: crypto.randomUUID() }, null, 2));
}

if (require.main === module) main().catch(err => { console.error(err); process.exit(1); });

