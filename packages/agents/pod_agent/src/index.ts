import fs from "fs";
import path from "path";
import crypto from "crypto";

async function main() {
  const concepts = ["retro-synth-wave-cat", "minimal-mountain-sunrise", "cyberpunk-lotus"];
  const outDir = process.env.ARTIFACTS_DIR || "/artifacts/pod";
  fs.mkdirSync(outDir, { recursive: true });
  const artifacts: string[] = [];
  for (const c of concepts) {
    for (let i = 0; i < 10; i++) {
      const file = path.join(outDir, `${c}-${i}.png`);
      fs.writeFileSync(file, Buffer.from([]));
      artifacts.push(file);
    }
  }
  const csv = ["filename,title,tags"].concat(artifacts.map(f => `${path.basename(f)},${path.basename(f, ".png").replaceAll("-", " ")},design,print`)).join("\n");
  const csvPath = path.join(outDir, "manifest.csv");
  fs.writeFileSync(csvPath, csv, "utf-8");
  artifacts.push(csvPath);
  console.log(JSON.stringify({ artifacts, correlationId: crypto.randomUUID() }, null, 2));
}

if (require.main === module) main().catch(err => { console.error(err); process.exit(1); });

